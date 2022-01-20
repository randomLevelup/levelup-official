const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const col1 = '#00313A'
const col2 = '#39A2DB'
const col3 = '#E8F0F2'

class Line {
    constructor(xPos, pointPos, isActive) {
        
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