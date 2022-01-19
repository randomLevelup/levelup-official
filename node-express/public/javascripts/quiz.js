const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const qSize = {x: 290, y: 180}
const aSize = {x: 370, y: 220}

const aScale = -60
const aDrop = 200

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
    constructor(x, y, sizeX, sizeY, text, textX, textY, pxSize) {
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

        this.hover = false
        this.hoverTime = 0

        this.text = text.split('\n')
        this.textPos = {
            x: textX,
            y: textY
        }
        this.pxSize = pxSize
        this.textHeight = (pxSize + 5) * this.text.length
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
    constructor(x, y, sizeX, sizeY, text, textX, textY, pxSize, answers) {
        super(x, y, sizeX, sizeY, text, textX, textY, pxSize)

        // answer format: [text, textX, textY, pxSize]
        this.answers = []
        const answersLength = answers.length * (sizeX + aScale + 45)
        const leftBound = x - (answersLength / 2)
        answers.forEach((answer, i) => {
            this.answers.push(new Button(
                leftBound + ((sizeX + aScale + 110) * i), y + aDrop,
                sizeX + aScale, sizeY + aScale, answer[0],
                answer[1], answer[2], answer[3]
            ))
        })
    }

    drawAnswers() {
        this.answers.forEach(answer => {
            answer.update()
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
        question.update()
        question.drawAnswers()
    })
}

console.log([canvas.width, canvas.height])

let questions = [
    // answer format: [text, textX, textY, pxSize]
    new Question(
        canvas.width / 2, 250, 200, 130, "how many legs\ndo i have?",
        35, 30, 30, [
            ["two", 50, 60, 24],
            ["three", 30, 60, 24],
            ["four", 40, 60, 24],
            ["five", 40, 60, 24] //,
            // ["six", 50, 60, 24]
        ]
    )
]
console.log(questions)

// button hover
addEventListener('mousemove', (pos) => {
    questions.forEach(question => {
        question.answers.forEach(an => {
            const corner = {
                x: an.pos.x - (an.size.x / 2),
                y: an.pos.y - (an.size.y / 2)
            }

            if (
                pos.clientX > corner.x &&
                pos.clientX < corner.x + an.size.x &&
                pos.clientY > corner.y &&
                pos.clientY < corner.y + an.size.y
            ) {
                an.hover = true
            }
            else {
                an.hover = false
            } 
        });
    })
})

animate()