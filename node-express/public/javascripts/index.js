const canvas = document.getElementById('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
const tPi = 2 * Math.PI

const cfg = {
    speed: {
        bigBubbleRamp: 0.4,
        bounceTime: 1,
        spraySpeed: 1,
    },
    size: {

    },
    vis: {
        showBeziers: false,
        showSplines: false
    }
}

let lastFPS = Date.now()
let delta
function checkFPS() {
    delta = Date.now() - lastFPS
    lastFPS = Date.now()
    requestAnimationFrame(checkFPS)
}
checkFPS()

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

function ramptoRadius(ramp, baseRadius) {
    const exponent = (-0.5 * ramp) + 5
    const divisor = 1 + (Math.E ** exponent)
    return (20 / divisor) + baseRadius
}
function circleToSquare(radius) {
    const toRoot = 2 * (radius ** 2)
    return Math.sqrt(toRoot)
}

class Bubble { // large bubble class
    constructor(x, y, radius, imgSrc, linkExt) {
        this.pos = {
            x: x,
            y: y
        }
        this.radius = radius
        this.ramp = 0
        this.baseRadius = radius

        this.maxTime = 500 + Math.floor((Math.random()) * 200)
        this.time = Math.floor(Math.random() * this.maxTime)

        this.hover = false
        this.hoverTime = 0

        this.imgSrc = imgSrc
        this.linkExt = linkExt
    }

    drawTest() {
        c.beginPath()
        c.arc(this.pos.x, this.pos.y, this.radius, 0, tPi, false)
        c.fillStyle = '#053742'
        c.fill()
        c.strokeStyle = '#39A2DB'
        c.lineWidth = 5
        c.stroke()
    }

    draw() {
        c.beginPath()
        c.arc(this.pos.x, this.pos.y, this.radius, 0, tPi, false)
        const grd = c.createRadialGradient(this.pos.x, this.pos.y, this.radius, this.pos.x, this.pos.y, 0)
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
        grd.addColorStop(0.3, 'rgba(255, 255, 255, 0.3)')
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)')
        c.fillStyle = grd
        c.fill()

        if (this.imgSrc != 'none') {
            const corner = {
                x: this.pos.x - (this.radius * 0.73),
                y: this.pos.y - (this.radius * 0.73)
            }
            const sideLength = circleToSquare(this.radius)
            const img = document.getElementById(this.imgSrc)
            c.drawImage(img, corner.x, corner.y, sideLength, sideLength)
        }
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
            this.time += cfg.speed.bounceTime
        }
        this.pos.y += this.getFloatPhase() // float bubble

        if (this.hover) {
            if (this.ramp < 20) {
                this.ramp += cfg.speed.bigBubbleRamp
                this.radius = ramptoRadius(this.ramp, this.baseRadius)
            }
        }
        else {
            if (this.ramp > 0) {
                this.ramp -= cfg.speed.bigBubbleRamp
                this.radius = ramptoRadius(this.ramp, this.baseRadius)
            }
        }

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
        this.imgSrc = 'none'
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
            if (dist <= 0) {
                const v = this.vel
                const n = this.getNormal(bubble)
                // simple vector math using homemade vector class 
                const u = VM.mult(n, (VM.dot(v, n) / VM.dot(n, n)))
                const w = VM.sub(v, u)
                this.vel = VM.sub(w, u)
            }
        })

        // apply buoyancy and yFriction
        this.vel.y -= (this.vel.y > -1) ? 0.006 : 0
        //apply xFriction
        if (Math.abs(this.vel.x) > 0) {
            this.vel.x = this.vel.x * 0.993
        }

        this.pos.x += this.vel.x * cfg.speed.spraySpeed
        this.pos.y += this.vel.y * cfg.speed.spraySpeed
        
        // pop surfaced bubbles
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
            c.arc(ex.x, ex.y, 5, 0, tPi, false)
            c.fillStyle = 'mediumSpringGreen'
            c.fill()
        })
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
        if (cfg.vis.showSplines) {
            c.strokeStyle = 'cyan'
            c.lineWidth = 5
            c.stroke()
        }
    }
    drawFill() {
        this.traceCurve()
        c.lineTo(canvas.width + 10, canvas.height + 10)
        c.lineTo(0, canvas.height + 10)
        c.fillStyle = this.fillColor
        c.fill()
        if (cfg.vis.showBeziers) {
            this.drawExtrema()
        }
    }
}

function addBubble(x, y, radius, imgSrc, linkExt) {
    const bubbleToCreate = new Bubble(x, y, radius, imgSrc, linkExt)
    bubbles.push(bubbleToCreate)
}
function addSpray(x) {
    const sprayToCreate = new Spray(x)
    sprays.push(sprayToCreate)
}

const bubbles = []
const sprays = []
let okToSpawn = false

function animate() { // animation loop
    requestAnimationFrame(animate)

    cfg.speed = {
        bigBubbleRamp: delta * 0.08,
        bounceTime: delta * 0.2,
        spraySpeed: delta * 0.18
    }
    okToSpawn = true // confirms that canvas window is visible

    const grd = c.createLinearGradient(0, canvas.height, 0, 0)
    grd.addColorStop(0, '#0F8AB4')
    grd.addColorStop(1, '#6AEAEB')
    c.beginPath()
    c.fillStyle = grd
    c.fillRect(0, 0, canvas.width, canvas.height)

    terrB.drawFill()
    terrM.drawFill()

    for (let i=sprays.length-1; i>=0; i--) {
        if (sprays[i].trash != 'false') {
            sprays.splice(i, 1) // take out the trash
        }
        else {
            sprays[i].updateSpray()
        }
    }
    bubbles.forEach(bubble => {
        bubble.update() // float bubbles
    })
    terrF.drawFill()
}

// init sequence
addBubble(270, 200, 130, 'aboutSource', 'about')
addBubble(750, 300, 80, 'mazeSource', 'maze')
addBubble(1000, 390, 80, 'physicsSource', 'bouncy')
addBubble(500, 450, 80, 'nodesSource', 'nodes')
addBubble(1200, 250, 80, 'splinesSource', 'spline')
const terrF = new Terrain(650, '#18618C')
const terrM = new Terrain(500, '#0F8AB4')
const terrB = new Terrain(350, '#2FA5C9')

animate()

setInterval(() => { // spawn spray
    if (okToSpawn) { // will only spawn if the canvas window is in view
        addSpray(Math.random() * canvas.width)
        okToSpawn = false
    }
}, 400)

// bubble hover
addEventListener('mousemove', (pos) => {
    bubbles.forEach(bubble => {
        const dist = Math.hypot(bubble.pos.x - pos.clientX, bubble.pos.y - pos.clientY)
        if (dist < bubble.radius) {
            bubble.hover = true
        }
        else {
            bubble.hover = false
        }
    })
})

// bubble click
function click(clickPos) {
    bubbles.forEach(bubble => {
        const dist = Math.hypot(bubble.pos.x - clickPos.x, bubble.pos.y - clickPos.y)
        if (dist < bubble.radius) {
            if (bubble.linkExt != 'none') {
                const linkTo = '../' + bubble.linkExt + '.html'
                location = linkTo
            }
        }
    })
}

addEventListener('mousedown', (pos) => {
    click({
        x: pos.clientX,
        y: pos.clientY
    })
})

addEventListener('touchstart', (event) => {
    event.preventDefault()
    cfg.vis.showBeziers = (cfg.vis.showBeziers) ? false : true
    cfg.vis.showSplines = (cfg.vis.showSplines) ? false : true

    click({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    })
})