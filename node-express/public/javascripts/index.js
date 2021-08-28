const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
const tPi = 2 * Math.PI

class LgBubble { // large bubble class
    constructor(x, y, radius) {
        this.x = x
        this.y = y
        this.radius = radius

        this.maxTime = 500 + Math.floor((Math.random()) * 200)
        this.time = Math.floor(Math.random() * this.maxTime)
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, tPi, false)
        c.strokeStyle = '#39A2DB'
        c.lineWidth = 5
        c.stroke()
    }

    update() {
        if (this.time > this.maxTime) {
            this.time = 0
        }
        else {
            this.time++
        }
        const phase = (this.time / this.maxTime) * tPi
        this.y += Math.sin(phase) / 5

        this.draw()
    }
}

function addBubble(x, y, radius) {
    bubbleToCreate = new LgBubble(x, y, radius)
    lgBubbles.push(bubbleToCreate)
}

const lgBubbles = []

function animate() { // animation loop
    requestAnimationFrame(animate)
    c.fillStyle = '#053742'
    c.fillRect(0, 0, canvas.width, canvas.height)

    lgBubbles.forEach(lgBubble => {
        lgBubble.update()
    })
}

// init sequence
addBubble(300, 200, 100)
addBubble(600, 300, 80)
animate()