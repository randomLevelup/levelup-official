const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const plotSpace = {
    x0: 110,
    y0: 110,
    x1: canvas.width - 110,
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
    
    c.fillStyle = palette[0]
    c.fillRect(0, 0, canvas.width, canvas.height)

    // draw screen

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

    let trace = true
    grid.forEach(line => { // connect the dots
        if (trace) {
            if (line.point.exists) {
                c.lineTo(line.xPos, plotSpace.y1 - (line.point.value * yHeight))
            }
            else {trace = false}
        }
    })
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
    new Scene([0,0.1,0.2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
]
scenes[0].reveal = true

animate()