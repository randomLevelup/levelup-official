const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Node {
    constructor(x, y, velX, velY) {
        this.pos = {
            x: x,
            y: y
        }
        this.vel = {
            x: velX,
            y: velY
        }
    }

    draw() {
        c.beginPath()
        c.arc(this.pos.x, this.pos.y, 10, 0, (2*Math.PI), false)
        c.fillStyle = "#FEDDBE"
        c.fill()
    }

    update() {
        this.pos.x = this.pos.x + this.vel.x
        this.pos.y = this.pos.y + this.vel.y
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
    c.fillStyle = '#0F1123'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // draw screen
    nodeArr.forEach(node => {
        node.update()
        node.draw()
    })
    for (let i=0; i<100; i++) {
        for (let j=0; j<100; j++) {
            const drawPoint = {
                x: (canvas.width / 100) * i,
                y: (canvas.height / 100) * j
            }
            let sumDist = 0
            nodeArr.forEach(node => {

                const iDist = Math.sqrt(
                    Math.pow(node.pos.x - drawPoint.x, 2) +
                    Math.pow(node.pos.y - drawPoint.y, 2)
                )
                // const term = (-1 * iDist) + 400
                const term = Math.pow(((iDist - 400) / 20), 2)
                sumDist += Math.max(term, 0)
            })
            if (sumDist > 260 && sumDist < 270) {
                c.beginPath()
                c.arc(drawPoint.x, drawPoint.y, 5, 0, (2*Math.PI), false)
                c.fillStyle = '#185ADB'
                c.fill()
            }
        }
    }
}

const nodeArr = [
    new Node(100, 350, 0.8, 0),
    new Node(1000, 400, -0.8, 0)
]

animate()