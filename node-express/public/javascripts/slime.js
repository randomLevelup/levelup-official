const lut = [
    [[0,0],[1,0],[1,1],[0,1]],
    [[0,0],[1,0],[1,1],[0.5,1],[0,0.5]],
    [[0,0],[1,0],[1,0.5],[0.5,1],[0,1]],
    [[0,0],[1,0],[1,0.5],[0,0.5]],
    [[0,0],[0.5,0],[1,0.5],[1,1],[0,1]],
    [
        [[0,0],[0.5,0],[0,0.5]],
        [[1,0.5],[1,1],[0.5,1]]
    ],
    [[0,0],[0.5,0],[0.5,1],[0,1]],
    [[0,0],[0.5,0],[0,0.5]],
    [[0.5,0],[1,0],[1,1],[0,1],[0,0.5]],
    [[0.5,0],[1,0],[1,1],[0.5,1]],
    [
        [[0.5,0],[1,0],[1,0.5]],
        [[0.5,1],[0,1],[0,0.5]]
    ],
    [[0.5,0],[1,0],[1,0.5]],
    [[0,0.5],[1,0.5],[1,1],[0,1]],
    [[1,0.5],[1,1],[0.5,1]],
    [[0.5,1],[0,1],[0,0.5]],
    []
]

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

function getWorldPos(row, col) {
    const result = {
        x: col * resolution,
        y: row * resolution
    }
    return(result)
}

class Vertex {
    constructor(value) {
        this.value = value
        this.iso = 1
    }

    clamp(threshold) {
        // this.iso = (this.value < threshold) ? 0 : 1
        if (this.value < threshold) {
            this.iso = 0
        }
    }

    draw(pos, size) {
        c.beginPath()
        c.arc(pos[0], pos[1], size, 0, (2*Math.PI), false)

        c.fillStyle = 'rgb(0,255,255)'
        c.fill()

        c.fillStyle = `rgba(255,0,255,${this.value / 200})`
        c.fill()
    }
}

class Cell {
    constructor(value) {
        this.value = value
    }

    static draw(pos, size, lookUp) {
        c.fillStyle = 'white'
        c.beginPath()
        c.moveTo(pos[0] + (size * lookUp[0][0]), pos[1] + (size * lookUp[0][1]))
        for (let i=1; i<lookUp.length; i++) {
            c.lineTo(pos[0] + (size * lookUp[i][0]), pos[1] + (size * lookUp[i][1])) 
        }
        c.fill()
    }
}

class Grid {
    constructor(sizeX, sizeY) {
        this.vList = []
        for (let i=0; i<sizeY; i++) {
            const newRow = []
            for (let j=0; j<sizeX; j++) {
                // newRow.push(new Vertex(Math.floor(Math.random() * 2)))
                newRow.push(new Vertex(200))
            }
            this.vList.push(newRow) // push the new rows into grid
        }

        this.cList = []
        for (let i=1; i<sizeY; i++) {
            const newRow = []
            for (let j=1; j<sizeX; j++) {
                newRow.push(new Cell(0))
            }
            this.cList.push(newRow)
        }
        this.updateCells()
    }

    updateVerts() {
        for (let i=0; i<this.vList.length; i++) {
            for (let j=0; j<this.vList[i].length; j++) {
                const worldPos = getWorldPos(i, j)
                this.vList[i][j].value = Math.hypot(
                    worldPos.x - mousePos.x,
                    worldPos.y - mousePos.y
                )
                this.vList[i][j].clamp(60)
            }
        }
    }

    isolate() {
        // dont need this function until vertexs weights are implemented
    }

    updateCells() {
        for (let i=0; i<this.cList.length; i++) {
            for (let j=0; j<this.cList[i].length; j++) {
                let lutTotal = 0
                this.getVertices(i, j).forEach((v, i) => {
                    // this method 'marches' around the square to get a LUT case int
                    lutTotal += (v.iso * (2 ** i))
                })
                this.cList[i][j].value = lutTotal
            }
        }
    }

    getVertices(cellPosY, cellPosX) {
        const result = [
            this.vList[cellPosY+1][cellPosX],
            this.vList[cellPosY+1][cellPosX+1],
            this.vList[cellPosY][cellPosX+1],
            this.vList[cellPosY][cellPosX],
        ]
        return(result)
    }

    drawDots(drawArr, radius) {
        let drawPos = [0, 0]
        for (let i=0; i<drawArr.length; i++) {
            for (let j=0; j<drawArr[i].length; j++) {
                drawArr[j][i].draw([drawPos[0], drawPos[1]], radius)
                drawPos[1] += resolution
            }
            drawPos[0] += resolution
            drawPos[1] = 0
        }
    }

    drawCells(size) {
        let drawPos = [0, 0]
        for (let i=0; i<this.cList.length; i++) {
            for (let j=0; j<this.cList.length; j++) {
                const lookUp = lut[this.cList[i][j].value]
                if (lookUp != null) {
                    if (lookUp.length > 2) {
                        Cell.draw(drawPos, size, lookUp)
                    }
                    else if (lookUp.length > 0) {
                        Cell.draw(drawPos, size, lookUp[0])
                        Cell.draw(drawPos, size, lookUp[1])
                    }
                }
                drawPos[0] += size
            }
            drawPos[1] += size
            drawPos[0] = 0
        }
    }
}

c.fillStyle = 'black'
c.fillRect(0, 0, canvas.width, canvas.height)

const resolution = 40
const grid = new Grid(
    (Math.max(canvas.width, canvas.height) / resolution) + 1,
    (Math.max(canvas.width, canvas.height) / resolution) + 1,
)

// grid.vList[1][1].value = 0
// grid.vList[1][2].value = 0


function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    
    if (mode == 'down') {
        grid.updateVerts()
    }
    grid.updateCells()
    grid.drawCells(resolution)
    grid.drawDots(grid.vList, 4)
}

const mousePos = {x: -1, y: -1}
addEventListener('mousemove', (evt) => {
    mousePos.x = evt.clientX
    mousePos.y = evt.clientY
})
let mode = 'up'
addEventListener('mousedown', (evt) => {
    mode = 'down'
})
addEventListener('mouseup', (evt) => {
    mode = 'up'
})

animate()