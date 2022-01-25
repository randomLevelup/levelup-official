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
            x: velx,
            y: vely
        }
    }

    draw() {
        c.arc(this.x, this.y, r, 0, (2*Math.PI), false)
        c.fillStyle = "#FEDDBE"
        c.fill()
    }

    update() {
        this.pos.x = this.pos.x + this.vel.x
        this.pos.y = this.pos.y + this.vel.y
        
        this.draw()
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
}

animate()