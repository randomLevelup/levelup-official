const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const qSize = {x: 290, y: 180}
const aSize = {x: 370, y: 220}

const qRaise = 160
const aDrop = 20

const col1 = '#00313A'
const col2 = '#39A2DB'
const col3 = '#E8F0F2'

class Question {
    constructor(question, pxSize, answers) {
        this.text = question.split('\n')
        this.pxSize = pxSize
        this.textHeight = (pxSize + 5) * this.text.length
        this.answers = answers
    }

    draw() {
        const corner = {
            x: (canvas.width / 2) - (qSize.x / 2),
            y: (canvas.height / 2) - qRaise - (qSize.y / 2)
        }

        c.fillStyle = col2
        c.beginPath()
        c.arc(
            (canvas.width / 2) - (qSize.x / 2), canvas.height / 2 - qRaise,
            qSize.y / 2, 0, 2 * Math.PI, false
        )
        c.arc(
            (canvas.width / 2) + (qSize.x / 2), canvas.height / 2 - qRaise,
            qSize.y / 2, 0, 2 * Math.PI, false
        )
        c.fill()
        c.fillRect(corner.x, corner.y, qSize.x, qSize.y)
        
        c.fillStyle = col3
        
        // !!! this.text is a list of strings; rework for iteration
        c.font = this.pxSize.toString() + 'px cream DEMO'
        c.fillText(this.text, corner.x, (canvas.height / 2) - qRaise)
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
        question.draw()
    })
}

console.log([canvas.width, canvas.height])

let questions = [
    new Question("one plus\none", 60, ["yes", "no", "maybe"])
]

animate()