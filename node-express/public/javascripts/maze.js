const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

Array.prototype.shuffle = function() { // imported this function
    let currentIndex = this.length, randomIndex

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--

        // And swap it with the current element.
        [this[currentIndex], this[randomIndex]] = [
        this[randomIndex], this[currentIndex]]
    }

    return this;
}

class Cell {
    constructor() {
        this.walls = {
            w: true,
            e: true,
            n: true,
            s: true
        }
        this.visited = false
    }

    breakWall(key) {
        this.walls[key] = false
    }

    visit() {
        this.visited = true
    }
}

function initGrid() {
    let result = []
    for (i=0; i<mazeSize; i++) {
        result.push([])
        for (j=0; j<mazeSize; j++) {
            result[i].push(new Cell())
        }
    }
    return result
}

const drawArr = {
    w: [{x: -1, y: 1}, {x: -1, y: -1}],
    e: [{x: 1, y: -1}, {x: 1, y: 1}],
    n: [{x: -1, y: -1}, {x: 1, y: -1}],
    s: [{x: 1, y: 1}, {x: -1, y: 1}],
}

const padding = 100
const cellWidth = 40

Array.prototype.drawGrid = function() {
    c.strokeStyle = '#EEEEEE'
    c.fillStyle = '#EEEEEE'
    c.lineWidth = 8

    grid.forEach((row, i) => {
        row.forEach((cell, j) => {
            const center = {
                x: 450 + (cellWidth * j), // wouldve used padding, no time
                y: padding + (cellWidth * i)
            }
            dirKeys.forEach(key => {
                if (cell.walls[key] &&
                    !((i == 0 && j == 0) && key == 'w') &&
                    !((i == mazeSize-1 && j == mazeSize-1) && key == 'e')) {
                    c.beginPath()
                    c.moveTo(
                        center.x + ((cellWidth / 2) * drawArr[key][0].x),
                        center.y + ((cellWidth / 2) * drawArr[key][0].y)
                    )
                    c.lineTo(
                        center.x + ((cellWidth / 2) * drawArr[key][1].x),
                        center.y + ((cellWidth / 2) * drawArr[key][1].y)
                    )
                    c.stroke()
                    
                    c.beginPath()
                    c.arc(
                        center.x + ((cellWidth / 2) * drawArr[key][0].x),
                        center.y + ((cellWidth / 2) * drawArr[key][0].y),
                        c.lineWidth/2, 0, (2*Math.PI), false
                    )
                    c.fill()
                }
            })
        })
    })
}

function tryKeys() {
    var ignored = 0
    var ignoreThis
    dirKeys.forEach(key => {
        let ant2 = {
            x: ant.x + dirDict[key].x,
            y: ant.y + dirDict[key].y
        }
        // begin "ignore cell" tests
        ignoreThis = false
        if ((ant2.x < 0) || (ant2.y < 0)) { // out of bounds (negative)
            ignoreThis = true
        }
        else if ((ant2.x >= mazeSize) || (ant2.y >= mazeSize)) { // out of bounds (positive)
            ignoreThis = true
        }
        else if (grid[ant2.y][ant2.x].visited) { // already visited
            ignoreThis = true
        }

        if (!ignoreThis) {
            // BREAK THE WALLS
            grid[ant.y][ant.x].breakWall(key)
            grid[ant.y][ant.x].visit()
            ant = {
                x: ant.x + dirDict[key].x,
                y: ant.y + dirDict[key].y
            }
            var flipKey
            if (key == 'w') {flipKey = 'e'}
            else if (key == 'e') {flipKey = 'w'}
            else if (key == 'n') {flipKey = 's'}
            else if (key == 's') {flipKey = 'n'}
            grid[ant.y][ant.x].breakWall(flipKey)
            grid[ant.y][ant.x].visit()
        }
        else {
            ignored++
        }
    })
    return (ignored == 4) ? true : false
}
    
const mazeSize = 15
var dirKeys = ['w', 'e', 'n', 's']
var dirDict = {
    w: {
        x: -1,
        y: 0
    },
    e: {
        x: 1,
        y: 0
    },
    n: {
        x: 0,
        y: -1
    },
    s: {
        x: 0,
        y: 1
    }
}
let grid = initGrid() // base grid
var ant // creates pathways between cells
var log // logs ant's positions for backtracing

while (!grid[mazeSize-1][mazeSize-1].visited) { // begin maze generation
    grid = initGrid()

    ant = {x: 0, y: 0}
    log = ['quit', {x: 0, y: 0}]

    while (log[log.length - 1] != 'quit') {
        // cell loop here
        dirKeys.shuffle()

        const trace = tryKeys()

        if (trace) {
            log.pop()
            ant = {
                x: log[log.length - 1].x,
                y: log[log.length - 1].y
            }
        }
        else {
            log.push({
                x: ant.x,
                y: ant.y
            })
        }
    }
}
// end maze generation

// interactivity support
class Player {
    constructor() {
        this.r = 0
        this.c = 0
        this.moveLog = []
    }

    move(moveObj) {
        this.r += moveObj.r
        this.c += moveObj.c
    }

    getPos(element) {
        if (element == null) {
            element = this
        }
        return {
            x: 450 + (cellWidth * element.c),
            y: padding + (cellWidth * element.r)
        }
    }

    draw() {
        let drawPos = this.getPos()
        let trailPos = this.getPos()
        
        if (this.moveLog.length > 0) {
            if (this.moveLog[0].t < maxTime) {
                drawPos = this.getPos(this.moveLog[0].p)
                drawPos = {
                    x: drawPos.x + ((cellWidth / maxTime) * this.moveLog[0].t * (dirDict[this.moveLog[0].d].x)),
                    y: drawPos.y + ((cellWidth / maxTime) * this.moveLog[0].t * (dirDict[this.moveLog[0].d].y))
                }
                trailPos = this.getPos(this.moveLog[0].p)
            }
            else {
                trailPos = this.getPos(this.moveLog[0].p)
                let trailTime = this.moveLog[0].t - maxTime
                trailTime = (trailTime < 0) ? 0 : trailTime
                trailPos = {
                    x: trailPos.x + ((cellWidth / maxTime) * trailTime * (dirDict[this.moveLog[0].d].x)),
                    y: trailPos.y + ((cellWidth / maxTime) * trailTime * (dirDict[this.moveLog[0].d].y))
                }
                if (this.moveLog.length > 1) {
                    drawPos = this.getPos(this.moveLog[1].p)
                    drawPos = {
                        x: drawPos.x + ((cellWidth / maxTime) * this.moveLog[1].t * (dirDict[this.moveLog[1].d].x)),
                        y: drawPos.y + ((cellWidth / maxTime) * this.moveLog[1].t * (dirDict[this.moveLog[1].d].y))
                    }
                }
            }
        }
        c.beginPath()
        c.arc(trailPos.x, trailPos.y, 7, 0, (2*Math.PI), false)
        c.fillStyle = '#FFD369'
        c.fill()

        c.beginPath()
        c.arc(drawPos.x, drawPos.y, 7, 0, (2*Math.PI), false)
        c.fillStyle = '#FFD369'
        c.fill()

        c.beginPath()
        c.moveTo(trailPos.x, trailPos.y)
        c.lineTo(drawPos.x, drawPos.y)
        c.strokeStyle = '#FFD369'
        c.lineWidth = 14
        c.stroke()
    }

    update() {
        if (this.moveLog.length > 0) {
            this.moveLog[0].t++ // increment first move
            if (this.moveLog[0].t > maxTime) {
                if (this.moveLog.length > 1) {
                    this.moveLog[1].t++ // increment second move
                }
                if (this.moveLog[0].t > maxTime * 2) {
                    this.moveLog.splice(0, 1)
                }
            }
        }
        this.draw()
    }
}

const player = new Player()

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = '#393E46'
    c.fillRect(0, 0, canvas.width, canvas.height)
    grid.drawGrid()

    player.update()
}

const maxTime = 15
animate()

addEventListener('keypress', (event) => {
    const direction = {
        w: {r: -1, c: 0},
        s: {r: 1, c: 0},
        a: {r: 0, c: -1},
        d: {r: 0, c: 1},
    }
    const dirToCardinal = {w: 'n', s: 's', a: 'w', d: 'e'}
    const wallToTest = grid[player.r][player.c].walls[dirToCardinal[event.key]]
    if (!wallToTest) {
        player.moveLog.push({
            p: {r: player.r, c: player.c},
            d: dirToCardinal[event.key],
            t: 0
        })
        player.move(direction[event.key])
    }
})
