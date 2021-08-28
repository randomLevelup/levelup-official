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

        this.draw()
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
    c.fillStyle = '#053742'
    c.fillRect(0, 0, canvas.width, canvas.height)

    bubbles.forEach(bubble => {
        bubble.update()
    })
    sprays.forEach(spray => {
        spray.updateSpray()
    })
}

// init sequence
addBubble(300, 200, 100)
addBubble(600, 300, 80)

addSpray(250)
addSpray(610)
animate()