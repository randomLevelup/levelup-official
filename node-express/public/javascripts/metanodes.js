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
    for (let i=0; i<80; i++) {
        for (let j=0; j<50; j++) {
            const drawPoint = {
                x: (canvas.width / 80) * i,
                y: (canvas.height / 50) * j
            }
            let sumDist = 0
            nodeArr.forEach(node => {

                const iDist = Math.sqrt(
                    Math.pow(node.pos.x - drawPoint.x, 2) +
                    Math.pow(node.pos.y - drawPoint.y, 2)
                )

                sumDist += Math.log2(iDist) // this works for some reason
            })
            if (true) {
                const opacity = (sumDist - 16) / 3

                c.beginPath()
                c.arc(drawPoint.x, drawPoint.y, 5, 0, (2*Math.PI), false)
                c.fillStyle = 'rgba(20, 90, 219, ' + opacity.toString() + ')'
                c.fill()
            }
        }
    }
}

const nodeArr = [
    new Node(100, 350, 2.5, 0),
    new Node(1000, 400, -2.5, 0)
]

animate()