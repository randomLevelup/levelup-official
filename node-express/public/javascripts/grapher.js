const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const plotSpace = {
    x0: 150,
    y0: 110,
    x1: canvas.width - 100,
    y1: canvas.height - 95
}
const yHeight = plotSpace.y1 - plotSpace.y0
const numLines = 20
const lineSpace = (plotSpace.x1 - plotSpace.x0) / numLines
let mode = 'orbit'

const palette = [
    '#041C32', '#04293A', '#064663', '#475F75',
    '#476C7D', '#4989A6', '#ECB365', '#FFF6A8'
]
const solbtn = document.getElementById('solution')
const nxtbtn = document.getElementById('next')
const axes = document.getElementById('axes')

class Line {
    constructor(xPos) {
        this.xPos = xPos
        this.point = {
            exists: false,
            value: 0 // between 0 and 1
        }
    }

    draw(mode) {
        c.strokeStyle = palette[2]
        c.lineWidth = 2
        c.beginPath()
        c.moveTo(this.xPos, plotSpace.y0)
        c.lineTo(this.xPos, plotSpace.y1)
        c.stroke()

        if (this.point.exists) {
            const yPos = plotSpace.y1 - (this.point.value * yHeight)
            c.beginPath()
            c.fillStyle = (mode == 'user') ? palette[6] : palette[4]
            c.arc(this.xPos, yPos, 10, 0, 7, false)
            c.fill()
        }
    }
}

class Scene {
    constructor(label, year1, year2, data) {
        this.label = label
        this.year1 = year1
        this.year2 = year2
        
        this.data = []
        for (let i=0; i<numLines; i++) {
            this.data.push(new Line(plotSpace.x0 + (lineSpace * i)))
            this.data[i].point.exists = true
            this.data[i].point.value = data[i]
        }
        this.reveal = false
    }
}

function touch(x, y) {
    // do something on touch
    if (x > 800 && x < 990 && y > 10 && y < 100) {
        scenes[cScene].reveal = (scenes[cScene].reveal) ? false : true
    }
    else if (x > 1000 && x < 1190 && y > 10 && y < 100) {
        scenes[cScene].reveal = false
        if (cScene + 1 >= scenes.length) {
            cScene = 0
        }
        else {cScene += 1}
        clearGrid(0)
        grid[0].point.value = scenes[cScene].data[0].point.value
    }
    mode = 'drag'
}

function cursor(x, y) {
    if (mode == 'drag') {
        if (y < plotSpace.y1 && y > plotSpace.y0) {
            let cDist = canvas.width
            let cIndex = 0
            grid.forEach((line, i) => {
                const dist = Math.abs(line.xPos - x)
                cIndex = (dist < cDist) ? i : cIndex
                cDist = (dist < cDist) ? dist : cDist
            })
            if (cIndex == activeLine) {
                grid[cIndex].point.value = (plotSpace.y1 - y) / yHeight
            }
            else if (cDist <= lineSpace) {
                if (cIndex > 0) { // check if previous point exists
                    if (grid[cIndex - 1].point.exists) {
                        activeLine = cIndex
                        grid[cIndex].point.exists = true
                        grid[cIndex].point.value = (plotSpace.y1 - y) / yHeight
                        clearGrid(cIndex)

                        if (cIndex < (numLines - 1)) {
                            grid[cIndex + 1].point.exists = false
                        }
                    }
                }
                else { // if leftmost line
                    activeLine = 0
                    grid[0].point.exists = true
                    grid[0].point.value = (plotSpace.y1 - y) / yHeight
                    clearGrid(cIndex)
                }
            }
        }
    }
}

addEventListener("mousedown", event => {
    touch(event.clientX, event.clientY)
})
let doubleToggle = false
let doubleTimer = 0
addEventListener('touchstart', event => {
    if (doubleToggle) {
        // do something on double click
        doubleToggle = false
        doubleTimer = 0
    }
    else {
        doubleToggle = true
        touch(event.touches[0].clientX, event.touches[0].clientY)
    }
})

addEventListener("mouseup", event => {
    mode = 'orbit'
})
addEventListener("touchend", event => {
    mode = 'orbit'
})

addEventListener('mousemove', event => {
    cursor(event.clientX, event.clientY)
})
addEventListener('touchMove', event => {
    cursor(event.touches[0].clientX, event.touches[0].clientY)
})

// addEventListener('contextmenu', event => {
//     event.preventDefault()
//     // do something on right click
// })

function clearGrid(cIndex) {
    for (i = cIndex+1; i < numLines; i++) {
        grid[i].point.exists = false
    }
}

function animate() {
    requestAnimationFrame(animate)

    doubleTimer += (doubleToggle) ? 1 : 0
    if (doubleTimer > 25) {doubleTimer = 0; doubleToggle = false}
        
    // draw frame background
    c.fillStyle = palette[0]
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.drawImage(axes, 50, 15, 1300, 600)
    c.drawImage(solbtn, 800, 10, 190, 90)
    c.drawImage(nxtbtn, 1000, 10, 190, 90)

    c.font = '30px cream DEMO'
    c.fillStyle = palette[5]
    c.fillText("Graph: " + scenes[cScene].label, 110, 50)
    c.fillText(scenes[cScene].year1 + "-" + scenes[cScene].year2, 198, 90)
    c.fillText(scenes[cScene].year1, 110, 595)
    c.fillText(scenes[cScene].year2, 1170, 595)
    
    c.font = '24px cream DEMO'
    c.fillText("(click and drag =>)", 250, 593)

    // draw frame
    if (scenes[cScene].reveal) {
        scenes[cScene].data.forEach(line => {
            line.draw('hint')
        })

        c.strokeStyle = palette[5]
        c.lineWidth = 4
        c.beginPath()
        c.moveTo(scenes[cScene].data[0].xPos, plotSpace.y1 - (scenes[cScene].data[0].point.value * yHeight))

        let trace = true
        scenes[cScene].data.forEach(line => { // connect the dots
            if (trace) {
                if (line.point.exists) {
                    c.lineTo(line.xPos, plotSpace.y1 - (line.point.value * yHeight))
                }
                else {trace = false}
            }
        })
        c.stroke()
    }

    grid.forEach(line => {
        line.draw('user')
    })

    c.strokeStyle = palette[7]
    c.lineWidth = 5
    c.beginPath()
    c.moveTo(grid[0].xPos, plotSpace.y1 - (grid[0].point.value * yHeight))
    let strOut = "0.15"

    let trace = true
    grid.forEach(line => { // connect the dots
        if (trace) {
            if (line.point.exists) {
                c.lineTo(line.xPos, plotSpace.y1 - (line.point.value * yHeight))
                strOut += "," + line.point.value.toString()
            }
            else {trace = false}
        }
    })
    c.stroke()
    console.log(strOut)
}

const grid = []
for (let i=0; i<numLines; i++) {
    grid.push(new Line(plotSpace.x0 + (lineSpace * i)))
}
let activeLine = 0
grid[0].point.exists = true
grid[0].point.value = 0.35

const scenes = [
    new Scene("Childrens' uninsurance rate in the U.S.", "1998", "2018", [0.91,0.903041825095057,0.8174904942965779,0.8060836501901141,0.8041825095057035,0.7984790874524715,0.7832699619771863,0.7661596958174905,0.747148288973384,0.7110266159695817,0.6368821292775665,0.5741444866920152,0.5057034220532319,0.42395437262357416,0.3060836501901141,0.20532319391634982,0.12357414448669202,0.07604562737642585,0.11787072243346007,0.12737642585551331,0.12737642585551331]),
    new Scene("Impoverished individuals in the U.S.", "1960", "2020", [0.35,0.3593155893536122,0.3593155893536122,0.3612167300380228,0.37072243346007605,0.5,0.688212927756654,0.7034220532319392,0.720532319391635,0.7433460076045627,0.7642585551330798,0.7889733840304183,0.8365019011406845,0.8802281368821293,0.94106463878327,0.9467680608365019,0.94106463878327,0.9619771863117871,0.9619771863117871,0.9562737642585551,0.9923954372623575]),
    new Scene("Impoverished households of 2 people", "1960", "2020", [0.67,0.6806083650190115,0.6977186311787072,0.7053231939163498,0.7091254752851711,0.7110266159695817,0.720532319391635,0.7338403041825095,0.7490494296577946,0.752851711026616,0.7585551330798479,0.7661596958174905,0.7908745247148289,0.8365019011406845,0.8878326996197718,0.8688212927756654,0.8536121673003803,0.8574144486692015,0.8745247148288974,0.8954372623574145,0.903041825095057]),
    new Scene("Impoverished families of 9 or more", "1980", "2020", [0.15,0.09125475285171103,0.09315589353612168,0.10456273764258556,0.12737642585551331,0.21673003802281368,0.4011406844106464,0.41254752851711024,0.41825095057034223,0.42015209125475284,0.42015209125475284,0.43155893536121676,0.467680608365019,0.5285171102661597,0.5988593155893536,0.7604562737642585,0.8098859315589354,0.8840304182509505,0.9125475285171103,0.9182509505703422,0.9467680608365019]),
    new Scene("Poverty rate among children in the U.S.", "1970", "2015", [0.69,0.6711026615969582,0.6007604562737643,0.5456273764258555,0.5228136882129277,0.5380228136882129,0.688212927756654,0.7395437262357415,0.7167300380228137,0.6920152091254753,0.720532319391635,0.7300380228136882,0.6501901140684411,0.5608365019011406,0.4467680608365019,0.38593155893536124,0.3650190114068441,0.3612167300380228,0.3517110266159696,0.3193916349809886,0.2870722433460076]),
    new Scene("Calculated poverty rate in the U.S.", "1990", "2020", [0.71,0.7300380228136882,0.8193916349809885,0.9619771863117871,0.9144486692015209,0.7585551330798479,0.6026615969581749,0.467680608365019,0.3288973384030418,0.33269961977186313,0.376425855513308,0.4467680608365019,0.5836501901140685,0.5779467680608364,0.6216730038022814,0.8650190114068441,0.8612167300380228,0.7889733840304183,0.7034220532319392,0.6863117870722434,0.5057034220532319]),
    new Scene("Effectiveness of poverty programs", "1970", "2015", [0.12,0.13688212927756654,0.16539923954372623,0.40874524714828897,0.5228136882129277,0.49619771863117873,0.48098859315589354,0.44866920152091255,0.4543726235741445,0.4828897338403042,0.526615969581749,0.5741444866920152,0.6197718631178707,0.6482889733840305,0.6730038022813688,0.7129277566539924,0.8688212927756654,0.7927756653992395,0.8098859315589354,0.8460076045627376,0.8536121673003803])
]
let cScene = 0

animate()