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
}

class Cell {
    constructor(value) {
        this.value = value
    }

    update(value) {
        this.value = value
    }

    draw(pos, size) {
        c.beginPath()
        c.fillStyle = `rgba(255, 255, 255, ${this.value / 16})`
        c.fillRect(pos[0], pos[1], pos[0]+size, pos[1]+size)
    }
}

class Grid {
    constructor(sizeX, sizeY) {
        const vList = []
        for (i=0; i<sizeY; i++) {
            const newRow = []
            for (j=0; j<sizeX; j++) {
                newRow.push(new Vertex(0)) // push the new vertices into rows
            }
            vList.push(newRow) // push the new rows into grid
        }

        const cList = []
        for (i=1; i<sizeY; i++) {
            const newRow = []
            for (j=1; j<sizeX; j++) {
                newRow.push(new Cell(0))
            }
            vList.push(newRow)
        }
        this.updateCells()
    }

    isolate() {
        // dont need this function until vertexs weights are implemented
    }

    updateCells() {
        for (i=0; i<this.cList.length; i++) {
            for (j=0; j<i.length; j++) {
                const lutTotal = 0
                this.getVertices(i, j).forEach((v, i) => {
                    // this method 'marches' around the square to get a LUT case int
                    lutTotal += (v.value * (2 ** i))
                })
                cList[i][j].update(lutTotal)
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

    draw() {
        const drawPos = [200, 200]
        for (i=0; i<this.cList.length; i++) {
            for (j=0; j<i.length; j++) {
                cList[i][j].draw(drawPos[0], drawPos[1])
                drawPos[1] += 10
            }
            drawPos[0] += 10
        }
    }
}

const grid = new Grid(10, 10)
c.fillStyle = 'black'
c.fillRect(0, 0, canvas.width, canvas.height)

