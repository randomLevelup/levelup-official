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
    '#041C32', '#04293A', '#064663', '#172F45',
    '#173C4D', '#173C4D', '#ECB365', '#FFC678'
]

class Line {
    constructor(xPos) {
        this.xPos = xPos
        this.point = {
            exists: false,
            value: 0 // between 0 and 1
        }
    }

    draw() {
        c.strokeStyle = palette[4]
        c.lineWidth = 2
        c.beginPath()
        c.moveTo(this.xPos, plotSpace.y0)
        c.lineTo(this.xPos, plotSpace.y1)
        c.stroke()

        if (this.point.exists) {
            const yPos = plotSpace.y1 - (this.point.value * yHeight)
            c.beginPath()
            c.fillStyle = palette[6]
            c.arc(this.xPos, yPos, 10, 0, 7, false)
            c.fill()
        }
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
    event.preventDefault()
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
    event.preventDefault()
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
    
    c.fillStyle = palette[0]
    c.fillRect(0, 0, canvas.width, canvas.height)

    // draw screen
    grid.forEach(line => {
        line.draw()
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
grid[0].point.value = 0.8

animate()