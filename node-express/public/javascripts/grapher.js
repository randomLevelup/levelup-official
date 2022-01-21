const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const plotSpace = {
    x0: 150,
    y0: 110,
    x1: canvas.width - 100,
    y1: canvas.height - 110
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
    constructor(data) {// TODO: implement image as part of construction
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
    
    const cScene = scenes[0]
    
    // draw frame background
    c.fillStyle = palette[0]
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.drawImage(axes, 50, 15, 1300, 650)

    // draw frame
    if (cScene.reveal) {
        cScene.data.forEach(line => {
            line.draw('hint')
        })

        c.strokeStyle = palette[5]
        c.lineWidth = 4
        c.beginPath()
        c.moveTo(cScene.data[0].xPos, plotSpace.y1 - (cScene.data[0].point.value * yHeight))

        let trace = true
        cScene.data.forEach(line => { // connect the dots
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
    console.log(strOut)
    c.stroke()
}

const grid = []
for (let i=0; i<numLines; i++) {
    grid.push(new Line(plotSpace.x0 + (lineSpace * i)))
}
let activeLine = 0
grid[0].point.exists = true
grid[0].point.value = 0.5

const scenes = [
    new Scene([0.35,0.3593155893536122,0.3593155893536122,0.3612167300380228,0.37072243346007605,0.5,0.688212927756654,0.7034220532319392,0.720532319391635,0.7433460076045627,0.7642585551330798,0.7889733840304183,0.8365019011406845,0.8802281368821293,0.94106463878327,0.9467680608365019,0.94106463878327,0.9619771863117871,0.9619771863117871,0.9562737642585551,0.9923954372623575]),
    new Scene([0.67,0.6806083650190115,0.6977186311787072,0.7053231939163498,0.7091254752851711,0.7110266159695817,0.720532319391635,0.7338403041825095,0.7490494296577946,0.752851711026616,0.7585551330798479,0.7661596958174905,0.7908745247148289,0.8365019011406845,0.8878326996197718,0.8688212927756654,0.8536121673003803,0.8574144486692015,0.8745247148288974,0.8954372623574145,0.903041825095057]),
    new Scene([0.15,0.09125475285171103,0.09315589353612168,0.10456273764258556,0.12737642585551331,0.21673003802281368,0.4011406844106464,0.41254752851711024,0.41825095057034223,0.42015209125475284,0.42015209125475284,0.43155893536121676,0.467680608365019,0.5285171102661597,0.5988593155893536,0.7604562737642585,0.8098859315589354,0.8840304182509505,0.9125475285171103,0.9182509505703422,0.9467680608365019])
]
scenes[0].reveal = true

animate()