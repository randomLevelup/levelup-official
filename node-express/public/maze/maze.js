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
            // visually break the walls
            c.beginPath()
            let penBreak = {
                x: padding.x + (cellWidth * ant.x) + (cellWidth / 2),
                y: padding.y + (cellWidth * ant.y) + (cellWidth / 2)
            }
            c.moveTo(penBreak.x + ((cellWidth / 2) * drawArr[key][0].x),
                     penBreak.y + ((cellWidth / 2) * drawArr[key][0].y))
            c.lineTo(penBreak.x + ((cellWidth / 2) * drawArr[key][1].x),
                     penBreak.y + ((cellWidth / 2) * drawArr[key][1].y))
            c.stroke()
            
            c.beginPath()
            c.arc(
                penBreak.x + ((cellWidth / 2) * drawArr[key][0].x),
                penBreak.y + ((cellWidth / 2) * drawArr[key][0].y),
                4, 0, (2*Math.PI), false
            )
            c.fill()

            c.beginPath()
            c.arc(
                penBreak.x + ((cellWidth / 2) * drawArr[key][1].x),
                penBreak.y + ((cellWidth / 2) * drawArr[key][1].y),
                4, 0, (2*Math.PI), false
            )
            c.fill()
            //
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
            //

        }
        else {
            ignored++
        }
    })
    return (ignored == 4) ? true : false
}

// end maze generation

// interactivity support
addEventListener('keypress', (event) => {
    if ('wasd'.indexOf(event.key) != -1) {
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
    }
})

addEventListener('mousemove', (event) => {
    if (phase == 'start') {
        if (event.clientX > 350 && event.clientX < 600 &&
            event.clientY > 280 && event.clientY < 380) {
                buttonFade = true
        }
        else {
            buttonFade = false
        }
    }
})

addEventListener('mousedown', (event) => {
    if (phase == 'start' && buttonFade) {
        phase = 'generate'
    }
})

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
            x: padding.x + (cellWidth * element.c) + (cellWidth / 2),
            y: padding.y + (cellWidth * element.r) + (cellWidth / 2)
        }
    }


    draw() {
        let drawPos = this.getPos()
        let time = 0
        let dir = {x: 0, y: 0}
        
        if (this.moveLog.length > 0) {
            drawPos = this.getPos(this.moveLog[0].p)
            time = this.moveLog[0].t
            dir = {
                x: dirDict[this.moveLog[0].d].x,
                y: dirDict[this.moveLog[0].d].y
            }
        }
        traceArr.push({
            x: drawPos.x + ((cellWidth / maxTime) * time * dir.x),
            y: drawPos.y + ((cellWidth / maxTime) * time * dir.y),
            t: 0
        })

        for (i=0; i<traceArr.length; i++) {
            if (traceArr[i].t == trailLength) {
                c.beginPath()
                c.arc(traceArr[i].x, traceArr[i].y, 8, 0, (2*Math.PI), false)
                c.fillStyle = '#393E46' // cut off trail
                c.fill()
                traceArr.splice(i, 1)
                i--
            }
            else if (traceArr[i].t >= 0) {
                c.beginPath()
                c.arc(traceArr[i].x, traceArr[i].y, 7, 0, (2*Math.PI), false)
                c.fillStyle = playerGradient // draw to trail
                c.fill()
                traceArr[i].t++
            }
            else {
                traceArr[i].t++ // continue to next trail spot
            }
        }
        if (this.moveLog.length == 0) {
            c.beginPath()
            c.arc(this.getPos().x, this.getPos().y, 7, 0, (2*Math.PI), false)
            c.fillStyle = playerGradient
            c.fill()
        }
    }

    update() {
        if (this.moveLog.length > 0) {
            this.moveLog[0].t++ // increment first move

            if (this.moveLog[0].t > maxTime) {
                this.moveLog.splice(0, 1)
            }
        }

        this.draw()
    }
}

c.fillStyle = '#393E46'
c.fillRect(0, 0, canvas.width, canvas.height)
const playerGradient = c.createLinearGradient(padding.x + 100,
                                              padding.y + 100,
                                              padding.x + 500,
                                              padding.y + 500)
playerGradient.addColorStop(0, '#FFD369')
playerGradient.addColorStop(1, '#00D369')

let gridDrawTime = 0
// c.drawImage(wasdImg, 900, 250, 264, 173)

function animate() { 
    requestAnimationFrame(animate)
    if (phase == 'start') {
        // button color calculator
        if (buttonFade) {
            if (buttonGradient < 1000) {
                buttonGradient += 20
            }
        }
        else {
            if (buttonGradient > 0) {
                buttonGradient -= 20
            }
        }
        const grad = c.createLinearGradient(0, 430 - buttonGradient, 0, 1430 - buttonGradient)
        grad.addColorStop(0, '#FFD369')
        grad.addColorStop(1, '#FFAE00')
        // draw start button with color based on hover
        c.beginPath()
        c.moveTo(400, 330)
        c.lineTo(550, 330)
        c.lineCap = 'round'
        c.strokeStyle = grad
        c.lineWidth = 100
        c.stroke()
        c.drawImage(generateImg, 375, 308, 204, 39)

    }
    else if (phase == 'generate') {
        if (gridDrawTime < 20) {
            // remove button with opacity
            c.fillStyle = 'rgba(57, 62, 70, 0.2)'
            c.fillRect(300, 230, 350, 200)
            gridDrawTime++
        }
        else if (gridDrawTime < 80) {
            if (gridDrawTime == 20) {
                c.strokeStyle = '#EEEEEE'
                c.fillStyle = '#EEEEEE'
                c.lineWidth = 8
            }
            // draw vertical lines flying down
            const vertFramePos = padding.y + (((cellWidth * (mazeSize)) / 60) * (gridDrawTime - 19))
            for (i=0; i<=mazeSize; i++) {
                c.beginPath()
                c.moveTo(padding.x + (cellWidth * i), padding.y)
                c.lineTo(padding.x + (cellWidth * i), vertFramePos)
                c.stroke() // why is this so slow
            }
            gridDrawTime++
        }
        else if (gridDrawTime < 140) {
            // draw horizontal lines flying right
            const horzFramePos = padding.x + (((cellWidth * (mazeSize)) / 60) * (gridDrawTime - 79))
            for (i=0; i<=mazeSize; i++) {
                c.beginPath()
                c.moveTo(padding.x, padding.y + (cellWidth * i))
                c.lineTo(horzFramePos, padding.y + (cellWidth * i))
                c.stroke() // why is this so slow
            }
            gridDrawTime++
        }
        else {
            if (gridDrawTime == 140) {
                grid = initGrid()

                ant = {x: 0, y: 0}
                log = ['quit', {x: 0, y: 0}]

                c.fillStyle = '#EEEEEE'
                c.strokeStyle = '#393E46'
                c.lineWidth = 9
            }

            if (log[log.length - 1] != 'quit') {
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
            else {
                phase = 'solve'
            }
            gridDrawTime++
        }
    }
    else if (phase == 'solve') {
        if (player == null) {player = new Player}
        player.update()
        
        // check if player is in bottom left,
        // if so, phase = repeat
    }
    else {
        // draw repeat button similar to start button
    }
}

let phase = 'start' // phases: start, generate, solve, repeat
animate()
