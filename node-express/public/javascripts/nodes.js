const cfg = {
    nodeData: {
    color: "#FEDDBE",
    radius: 8,
    speed: 0.7
},
glowData: {
    color: "#185ADB",
    ringWidth: 25,
    opacityMax: 0.3
},
lineData: {
    color: "#FEDDBE",
    opacityMult: 50,
    threshold: 0.3,
    width: 2
},
simData: {
    bgColor: "#0A1931",
    spawnTime: 80,
    magnetStrength: 1
}
}

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

String.prototype.hexToRgbA = function() { // imported this function
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(this)){
        c = this.substring(1).split('')
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]]
        }
        c = '0x' + c.join('')
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',') + ',1)'
    }
    throw new Error('Bad Hex')
}
String.prototype.setAlpha = function(value) {
    const alphaIndex = this.lastIndexOf(',')+1
    return this.substr(0, alphaIndex) + value + ')'
}

class Node {
    constructor(x, y, velocity) {
        this.x = x
        this.y = y
        this.velocity = velocity
    }

    getPos() {
        return [this.x, this.y]
    }

    draw() {
        const r = cfg.nodeData.radius

        c.beginPath()
        c.arc(this.x, this.y, r+cfg.glowData.ringWidth, 0, (2*Math.PI), false)
        const grd = c.createRadialGradient(this.x, this.y, r+cfg.glowData.ringWidth, this.x, this.y, r)
        const col = cfg.glowData.color.hexToRgbA()
        grd.addColorStop(0, col.setAlpha(0))
        grd.addColorStop(1, col.setAlpha(cfg.glowData.opacityMax))
        c.fillStyle = grd
        c.fill()

        c.beginPath()
        c.arc(this.x, this.y, r, 0, (2*Math.PI), false)
        c.fillStyle = cfg.nodeData.color
        c.fill()
    }

    update() {
        // move away from mouse
        const distance = Math.hypot(
            (mousePos.x - this.x),
            (mousePos.y - this.y)
        )
        // add pi to invert the angle
        const forceAngle = Math.atan2(
            (this.y - mousePos.y),
            (this.x - mousePos.x)
        )
        this.velocity.x += (
            Math.cos(forceAngle) * (cfg.simData.magnetStrength / distance)
        )
        this.velocity.y += (
            Math.sin(forceAngle) * (cfg.simData.magnetStrength / distance)
        )

        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        
        this.draw()
    }
}

const nodes = []

function spawnNode() {
let spawnX = Math.floor(Math.random() * canvas.width)
let spawnY = Math.floor(Math.random() * canvas.height)

const edgeChoice = ['n', 'e', 's', 'w'][Math.floor(Math.random() * 4)]
// edge depth: radius 10
if (edgeChoice == 'n') {spawnY = -10}
if (edgeChoice == 'e') {spawnX = canvas.width + 10}
if (edgeChoice == 's') {spawnY = canvas.height + 10}
if (edgeChoice == 'w') {spawnX = -10}

const spawnAngle = Math.random() * (2 * Math.PI)

const node = new Node(
    spawnX,
    spawnY,
    {
        x: Math.cos(spawnAngle) * cfg.nodeData.speed,
        y: Math.sin(spawnAngle) * cfg.nodeData.speed
    }
)
nodes.push(node)
}

function animate() {
requestAnimationFrame(animate)
c.fillStyle = cfg.simData.bgColor
c.fillRect(0, 0, canvas.width, canvas.height)

if (nodes.length > 0) {
    nodes.forEach((node, index) => {
        node.update()

        if (
            node.x + 10 < 0 ||
            node.x - 10 > canvas.width ||
            node.y + 10 < 0 ||
            node.y - 10 > canvas.height
        ) {
            setTimeout(() => {nodes.splice(index, 1)}, 0)
        }
    })
}

// lines
nodes.forEach((nodeA, indexA) => {
    nodes.forEach((nodeB, indexB) => {
        if (indexA > indexB) {
            distance = Math.hypot(
                (nodeA.x - nodeB.x),
                (nodeA.y - nodeB.y)
            )
            let alphaValue = (
                ((1 / distance) * cfg.lineData.opacityMult) - cfg.lineData.threshold
            )
            alphaValue = (alphaValue < 0) ? 0 : alphaValue

            let strokeColor = cfg.lineData.color.hexToRgbA()
            c.strokeStyle = strokeColor.setAlpha(alphaValue)
            c.lineWidth = cfg.lineData.width
            c.beginPath()
            c.moveTo(nodeA.x, nodeA.y)
            c.lineTo(nodeB.x, nodeB.y)
            c.stroke()
        }
    })
})
}

const mousePos = {x: 0, y: 0}
addEventListener('mousemove', (pos) => {
mousePos.x = pos.clientX
mousePos.y = pos.clientY
})

setInterval(() => {spawnNode()}, cfg.simData.spawnTime)
animate()