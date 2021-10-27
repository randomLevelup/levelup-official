let lut = [
    [[0,0],[1,0],[1,1],[0,1]],
    [[0,0],[1,0],[1,1],['0',1],[0,'0']],
    [[0,0],[1,0],[1,'1'],['1',1],[0,1]],
    [[0,0],[1,0],[1,'1'],[0,'0']],
    [[0,0],['2',0],[1,'2'],[1,1],[0,1]],
    [
        [[0,0],['2',0],[0,'1']],
        [[1,'2'],[1,1],['0',1]]
    ],
    [[0,0],['2',0],['1',1],[0,1]],
    [[0,0],['2',0],[0,'0']],
    [['3',0],[1,0],[1,1],[0,1],[0,'3']],
    [['3',0],[1,0],[1,1],['0',1]],
    [
        [['3',0],[1,0],[1,'1']],
        [['1',1],[0,1],[0,'3']]
    ],
    [['3',0],[1,0],[1,'1']],
    [[0,'3'],[1,'2'],[1,1],[0,1]],
    [[1,'2'],[1,1],['0',1]],
    [['2',1],[0,1],[0,'3']],
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

function interpolate(c1, c2) { // something funky is going on
    const diff = c2 - c1
    return (diff / (resolution * 2)) + 0.5

}

function deepCopyFunction(inObject) { // imported this function
    let outObject, value, key
    if (typeof inObject !== "object" || inObject === null) {
        return inObject // Return the value if inObject is not an object
    }
    // Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {}
    for (key in inObject) {
        value = inObject[key]
        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = deepCopyFunction(value)
    }
    return outObject
}

class Ball {
    constructor(x, y, radius, vel) {
        this.x = x
        this.y = y
        this.radius = radius

        const theta = Math.random() * (2 * Math.PI)
        this.velX = Math.cos(theta) * vel
        this.velY = Math.sin(theta) * vel
    }
    update() {
        if (this.x + this.radius > canvas.width) {
            this.velX *= -1
        }
        if (this.x - this.radius < 0) {
            this.velX *= -1
        }
        if (this.y + this.radius > canvas.height) {
            this.velY *= -1
        }
        if (this.y - this.radius < 0) {
            this.velY *= -1
        }

        this.x += this.velX
        this.y += this.velY
    }
    draw() {
        c.strokeStyle = 'red'
        c.lineWidth = 2
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, (2*Math.PI), false)
        c.stroke()
    }
}

function fillBalls(minRad, maxRad, vel, amt) {
    const result = []
    for (let i=0; i<=amt; i++) {
        const rad = minRad + (Math.random() * (maxRad - minRad))
        const xPos = rad + (Math.random() * canvas.width - (2 * rad))
        const yPos = rad + (Math.random() * canvas.height - (2 * rad))
        result.push(new Ball(xPos, yPos, rad, vel))
    }
    return result
}

class Vertex {
    constructor(value) {
        this.value = value
        this.iso = 1
    }

    clamp(threshold) {
        this.iso = (this.value < threshold) ? 0 : 1 // this will use active vertex points
        // if (this.value < threshold) { // this will draw constant iso values
        //     this.iso = 0
        // }
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

    static draw(pos, size, lookUp, corners) {
        for (let i=0; i<lookUp.length; i++) {
            for (let j=0; j<lookUp[i].length; j++) {
                if (lookUp[i][j] == 'n') {
                    lookUp[i][j] = interpolate(corners[3].value, corners[2].value)
                }
                else if (lookUp[i][j] == 'e') {
                    lookUp[i][j] = interpolate(corners[2].value, corners[1].value)
                }
                else if (lookUp[i][j] == 's') {
                    lookUp[i][j] = interpolate(corners[0].value, corners[1].value)
                }
                else if (lookUp[i][j] == 'w') {
                    lookUp[i][j] = interpolate(corners[3].value, corners[0].value)
                }
            }
        }
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
                this.vList[i][j].value = 0
                balls.forEach(ball => {
                    const dist = Math.hypot(
                        // CHECK DISTANCE FROM EVERY BALL
                        worldPos.x - ball.x,
                        worldPos.y - ball.y
                    )
                    this.vList[i][j].value += Math.E ** ((((0.00003 * ball.radius) - 0.0115) * dist) + 5.3)
                })
                this.vList[i][j].clamp(75)
            }
        }
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

    drawDots(radius) {
        let drawPos = [0, 0]
        for (let i=0; i<this.vList.length; i++) {
            for (let j=0; j<this.vList[i].length; j++) {
                this.vList[j][i].draw([drawPos[0], drawPos[1]], radius)
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
                const lookUp = deepCopyFunction(lut[this.cList[i][j].value])
                
                const corners = this.getVertices(i, j)
                if (lookUp != null) {
                    if (lookUp.length > 2) {
                        Cell.draw(drawPos, size, lookUp, corners)
                    }
                    else if (lookUp.length > 0) {
                        Cell.draw(drawPos, size, lookUp[0], corners)
                        Cell.draw(drawPos, size, lookUp[1], corners)
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

const resolution = 30 // SET RESOLUTION!!!!
const balls = fillBalls(50, 200, 2, 4)
const grid = new Grid(
    (Math.max(canvas.width, canvas.height) / resolution) + 1,
    (Math.max(canvas.width, canvas.height) / resolution) + 1,
)

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)

    balls.forEach(ball => {ball.update()})
    balls.forEach(ball => {ball.draw()})
    grid.updateVerts()
    grid.updateCells()
    grid.drawCells(resolution)
    grid.drawDots(2) // SET DEBUG DOT SIZE!!!
}

animate()