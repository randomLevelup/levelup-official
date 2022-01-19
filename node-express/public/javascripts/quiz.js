const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const qSize = {x: 290, y: 180}
const aSize = {x: 370, y: 220}

const qRaise = 160
const aDrop = 20

const bubbleRamp = 0.4

const col1 = '#00313A'
const col2 = '#39A2DB'
const col3 = '#E8F0F2'

function ramptoSize(ramp, baseSize) {
    const exponent = (-0.5 * ramp) + 5
    const divisor = 1 + (Math.E ** exponent)
    return {
        x: (20 / divisor) + baseSize.x,
        y: (20 / divisor) + baseSize.y
    }
}

class Button { // large bubble class
    constructor(x, y, sizeX, sizeY) {
        this.pos = {
            x: x,
            y: y
        }
        this.size = {
            x: sizeX,
            y: sizeY
        }
        this.ramp = 0
        this.baseSize = {
            x: sizeX,
            y: sizeY
        }

        this.maxTime = 500 + Math.floor((Math.random()) * 200)
        this.time = Math.floor(Math.random() * this.maxTime)

        this.canHover = true
        this.hover = false
        this.hoverTime = 0
    }

    drawTest() {
        c.beginPath()
        c.arc(this.pos.x, this.pos.y, this.radius, 0, 7, false)
        c.fillStyle = '#053742'
        c.fill()
        c.strokeStyle = '#39A2DB'
        c.lineWidth = 5
        c.stroke()
    }

    draw() {
        const corner = {
            x: this.pos.x - (this.size.x / 2),
            y: this.pos.y - (this.size.y / 2)
        }

        c.fillStyle = col2
        c.beginPath()
        c.arc(
            corner.x, corner.y + (this.size.y / 2),
            (this.size.y / 2), 0, 2 * Math.PI, false
        )
        c.arc(
            corner.x + this.size.x, corner.y + (this.size.y / 2), 
            (this.size.y / 2), 0, 2 * Math.PI, false
        )
        c.fill()
        c.fillRect(corner.x, corner.y, this.size.x, this.size.y)
    }

    getFloatPhase() {
        const phase = (this.time / this.maxTime) * (2 * Math.PI)
        return Math.sin(phase) / 10
    }

    update() {
        if (this.time > this.maxTime) {
            this.time = 0
        }
        else {
            this.time += 1
        }
        // this.pos.y += this.getFloatPhase() // floaty

        if (this.hover) {
            if (this.ramp < 20) {
                this.ramp += bubbleRamp
                this.size = ramptoSize(this.ramp, this.baseSize)
            }
        }
        else {
            if (this.ramp > 0) {
                this.ramp -= bubbleRamp
                this.size = ramptoSize(this.ramp, this.baseSize)
            }
        }

        this.draw()
    }
}

class Question extends Button{
    constructor(x, y, question, pxSize, textX, textY, answers) {
        super(x, y, 200, 120)
        this.canHover = false

        this.text = question.split('\n')
        this.textPos = {
            x: textX,
            y: textY
        }
        this.pxSize = pxSize
        this.textHeight = (pxSize + 5) * this.text.length
        this.answers = answers
    }

    drawQuestion() {
        this.update()

        const corner = {
            x: this.pos.x - (this.size.x / 2),
            y: this.pos.y - (this.size.y / 2)
        }

        c.fillStyle = col3
        // !!! this.text is a list of strings; rework for iteration
        c.font = this.pxSize.toString() + 'px cream DEMO'
        this.text.forEach((line, i) => {
            c.fillText(
                line, corner.x + this.textPos.x,
                corner.y + this.textPos.y + ((this.pxSize + 5) * i)
            )
        })
        
    }
}

function touch(x, y) {
    // do something on touch
}

addEventListener("mousedown", event => {
    touch(event.clientX, event.clientY)
})
let doubleToggle = false
let doubleTimer = 0
addEventListener('touchstart', event => {
    event.preventDefault()
    if (doubleToggle) {
        // do something on double click
        doubleToggle = false
        doubleTimer = 0
    }
    else {
        doubleToggle = true
        touch(event.touches[0].clientX, event.touches[0].clientY)
    }
})

addEventListener('contextmenu', event => {
    event.preventDefault()
    // do something on right click
})



function animate() {
    requestAnimationFrame(animate)

    doubleTimer += (doubleToggle) ? 1 : 0
    if (doubleTimer > 25) {doubleTimer = 0; doubleToggle = false}
    
    c.fillStyle = col1
    c.fillRect(0, 0, canvas.width, canvas.height)

    // draw screen
    questions.forEach(question => {
        question.drawQuestion()
    })
}

console.log([canvas.width, canvas.height])

let questions = [
    new Question(400, 200, "one plus\none", 35, 30, 50, ["yes", "no", "maybe"])
]

// button hover
addEventListener('mousemove', (pos) => {
    questions.forEach(qu => {
        if (
            pos.clientX > qu.pos.x &&
            pos.clientX < qu.pos.x + qu.size.x &&
            pos.clientY > qu.pos.y &&
            pos.clientY < qu.pos.y + qu.size.y &&
            qu.canHover
        ) {
            qu.hover = true
        }
        else {
            qu.hover = false
        }
    })
})

animate()