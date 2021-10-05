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
    []
]

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Vertex {
    constructor(value) {
        this.value = value
    }

    update(value) {
        this.value = value
    }

    draw(pos, size) {
        c.beginPath()
        c.fillStyle = (this.value == 1) ? 'purple' : 'yellow'
        c.arc(pos[0], pos[1], size, 0, (2*Math.PI), false)
        c.fill()
    }
}

class Cell {
    constructor(value) {
        this.value = value
    }

    update(value) {
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
                newRow.push(new Vertex(Math.floor(Math.random() * 2)))
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

    isolate() {
        // dont need this function until vertexs weights are implemented
    }

    updateCells() {
        for (let i=0; i<this.cList.length; i++) {
            for (let j=0; j<this.cList[i].length; j++) {
                let lutTotal = 0
                this.getVertices(i, j).forEach((v, i) => {
                    // this method 'marches' around the square to get a LUT case int
                    lutTotal += (v.value * (2 ** i))
                })
                this.cList[i][j].update(lutTotal)
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

    draw(drawArr, size) {
        let drawPos = [200, 170]
        for (let i=0; i<drawArr.length; i++) {
            for (let j=0; j<drawArr[i].length; j++) {
                drawArr[i][j].draw([drawPos[0], drawPos[1]], size)
                drawPos[1] += 40
            }
            drawPos[0] += 40
            drawPos[1] = 170
        }
    }

    drawCells(size) {
        let drawPos = [200, 170]
        for (let i=0; i<this.cList.length; i++) {
            for (let j=0; j<this.cList.length; j++) {
                const lookUp = lut[this.cList[i][j].value]
                console.log(this.cList[i][j].value)
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
            drawPos[0] = 200
        }
    }
}

c.fillStyle = 'black'
c.fillRect(0, 0, canvas.width, canvas.height)

const grid = new Grid(10, 10)
// grid.vList[0][3] = new Vertex(1)
grid.updateCells()
grid.drawCells(40)
grid.draw(grid.vList, 5)