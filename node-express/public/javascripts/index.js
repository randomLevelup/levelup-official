const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
const tPi = 2 * Math.PI

class VM { // vector math abstract class
    static dot(a, b) {
        return (a.x * b.x) + (a.y * b.y)
    }

    static mult(a, b) {
        return {
            x: a.x * b,
            y: a.y * b
        }
    }

    static sub(a, b) {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        }
    }
}

class Bubble { // large bubble class
    constructor(x, y, radius) {
        this.pos = {
            x: x,
            y: y
        }
        this.radius = radius

        this.maxTime = 500 + Math.floor((Math.random()) * 200)
        this.time = Math.floor(Math.random() * this.maxTime)
    }

    draw() {
        c.beginPath()
        c.arc(this.pos.x, this.pos.y, this.radius, 0, tPi, false)
        c.fillStyle = '#053742'
        c.fill()
        c.strokeStyle = '#39A2DB'
        c.lineWidth = 5
        c.stroke()
    }

    getFloatPhase() {
        const phase = (this.time / this.maxTime) * tPi
        return Math.sin(phase) / 5
    }

    update() {
        if (this.time > this.maxTime) {
            this.time = 0
        }
        else {
            this.time++
        }
        this.pos.y += this.getFloatPhase()
        this.draw()
    }
}
class Spray extends Bubble {
    constructor(x) {
        super(x, canvas.height + 10, 10)
        this.vel = {
            x: 0,
            y: 0
        }
        this.trash = 'false'
    }
    getNormal(bubble) {
        const result = {
            x: this.pos.x - bubble.pos.x,
            y: (this.pos.y - bubble.pos.y) - bubble.getFloatPhase()
        }
        return result
    }

    updateSpray() {
        // collision detection
        bubbles.forEach(bubble => {
            let dist = Math.hypot(bubble.pos.x - this.pos.x, bubble.pos.y - this.pos.y)
            dist -= (bubble.radius + 10)
            if (dist < -10) { // garbage collection
                this.trash = true
            }
            if (dist <= 0) {
                const v = this.vel
                const n = this.getNormal(bubble)
                // simple vector math using homemade vector class 
                const u = VM.mult(n, (VM.dot(v, n) / VM.dot(n, n)))
                const w = VM.sub(v, u)
                this.vel = VM.sub(w, u)
            }
        });

        // apply buoyancy and yFriction
        this.vel.y -= (this.vel.y > -1) ? 0.006 : 0
        //apply xFriction
        this.vel.x -= (this.vel.x > 0) ? 0.001 : 0

        this.pos.x += this.vel.x
        this.pos.y += this.vel.y
        
        // more garbage collection
        if (!this.trash) {
            if (this.pos.y < -20) {
                this.trash = true
            }
        }

        this.draw()
    }

}

class Terrain {
    constructor(yLevel, fillColor) {
        this.fillColor = fillColor
        this.startPoint = {x: -10, y: yLevel, amp: 50}
        this.extrema = [this.startPoint]
        let pen = {x: this.startPoint.x, y: this.startPoint.y, amp: this.startPoint.amp}
        const minMax = [-1, 1]
        let ticker = 0
        while (pen.x < canvas.width) { // generate terrain extrema
            pen.x += 100 + (Math.random() * 150)
            pen.y += (minMax[ticker % 2]) * (10 + (Math.random() * 50))
            pen.amp = 50 + (Math.random() * 50)
            this.extrema.push({x: pen.x, y: pen.y, amp: pen.amp})
            ticker++
        }
    }

    drawExtrema() {
        this.extrema.forEach(ex => {
            c.beginPath()
            c.arc(ex.x, ex.y, 5, 0, (2*Math.PI), false)
            c.fillStyle = 'mediumSpringGreen'
            c.fill()
        });
    }
    traceCurve() {
        c.beginPath()
        c.moveTo(this.extrema[0].x, this.extrema[0].y)
        for (let i=1; i<this.extrema.length; i++) {
            c.bezierCurveTo(
                this.extrema[i-1].x + this.extrema[i-1].amp,
                this.extrema[i-1].y,
                this.extrema[i].x - this.extrema[i].amp,
                this.extrema[i].y,
                this.extrema[i].x,
                this.extrema[i].y
            )
        }
        // c.strokeStyle = 'cyan'
        // c.lineWidth = 5
        // c.stroke()
    }
    drawFill() {
        this.traceCurve()
        c.lineTo(canvas.width + 10, canvas.height + 10)
        c.lineTo(0, canvas.height + 10)
        c.fillStyle = this.fillColor
        c.fill()
    }
}

function addBubble(x, y, radius) {
    const bubbleToCreate = new Bubble(x, y, radius)
    bubbles.push(bubbleToCreate)
}
function addSpray(x) {
    const sprayToCreate = new Spray(x)
    sprays.push(sprayToCreate)
}

const bubbles = []
const sprays = []

function animate() { // animation loop
    requestAnimationFrame(animate)
    const grd = c.createLinearGradient(0, canvas.height, 0, 0)
    grd.addColorStop(0, '#0F8AB4')
    grd.addColorStop(1, '#6AEAEB')
    c.beginPath()
    c.fillStyle = grd
    c.fillRect(0, 0, canvas.width, canvas.height)

    terrB.drawFill()

    for (let i=sprays.length-1; i>=0; i--) {
        if (sprays[i].trash != 'false') {
            sprays.splice(i, 1) // garbage collection
        }
        else {
            sprays[i].updateSpray()
        }
    }
    bubbles.forEach(bubble => {
        bubble.update() // float bubbles
    })
    terrM.drawFill()
    terrF.drawFill()
}

// init sequence
addBubble(300, 200, 100)
addBubble(600, 300, 80)
const terrF = new Terrain(650, '#18618C')
const terrM = new Terrain(500, '#0F8AB4')
const terrB = new Terrain(350, '#2FA5C9')

animate()

setInterval(() => {
    addSpray(Math.random() * canvas.width)
}, 400);