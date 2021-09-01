const cfg = {
    ballData: {
        speed: 1.2,
        radius: 50, // must be integer
        color: "#4CA1A3",
        lineWidth: 3
    },
    glowData: { // set stepCount to 0 for no glow
        color: "#4CA1A3",
        radiusStep: 1, // integer: larger values for a wider, aliased glow
        opacityStep: 0.01, // larger values steepen the opacity slope
        stepCount: 16 // larger values for a bigger, brighter glow
    },
    rippleData: {
        fadeTime: 600, // frames until ripple effect fades
        color: "#A5E1AD",
        widthStart: 0.1, // larger values make a wider ripple
        widthStep: 0.1, // larger values make the ripple spread farther
        opacityMax: 1,
        opacityStep: 0.1 // larger values steepen the opacity slope
    },
    bounceData: {
        time: 250, // time that the bounce takes
        ramp: 3, // integer: how fast the spring motion decays
        amp: 6.5 // amplitude of the bounce sine wave
    },
    simData: {
        bgColor: "#21094E",
        spawnTime: 500, // milliseconds between spawns
        hitEffect: "both" // ripple || bounce || both || none
    }
}

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

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
const limit = cfg.ballData.radius * 2 // edge depth: radius 100

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

class Ball {
    constructor(x, y, radius, vel) {
        this.x = x
        this.y = y
        this.radius = radius
        this.vel = vel

        this.hitList = []
    }

    getNormal(that) {
        let result = {
            x: that.x - this.x,
            y: that.y - this.y
        }
        return VM.mult(result, 1/Math.hypot(result.x, result.y))
    }

    static bounceFunction(t) {
        const data = cfg.bounceData
        const exp = Math.E ** ((t - data.time) / (data.time / (2 * data.ramp)))
        const trig = Math.sin(t / ((data.time / (2 * data.ramp)) / Math.PI))
        return (data.amp * exp * trig) + cfg.ballData.radius
    }

    draw() {
        let theta = 0, rX = this.radius, rY = this.radius

        // bounce warping
        if (this.hitList.length > 0 &&
            (cfg.simData.hitEffect == 'bounce' ||
            cfg.simData.hitEffect == 'both')) {
    
            theta = this.hitList.slice(-1)[0].a
            rX = Ball.bounceFunction(this.hitList.slice(-1)[0].tB)
            rY = (-1 * rX) + (2 * this.radius)
        }

        // glow
        let glowColor = cfg.glowData.color.hexToRgbA()
        c.lineWidth = cfg.glowData.radiusStep
        const opacityMax = cfg.glowData.opacityStep * cfg.glowData.stepCount
        for (
            let i = 0, o = opacityMax;
            i < cfg.glowData.stepCount;
            i += cfg.glowData.radiusStep, o -= cfg.glowData.opacityStep
            ) {
            glowColor = glowColor.setAlpha(o)
            c.strokeStyle = glowColor
            c.beginPath()
            c.ellipse(this.x, this.y, rX-i, rY-i, theta, 0, 2*Math.PI, false)
            c.stroke()
            c.beginPath()
            c.ellipse(this.x, this.y, rX+i, rY+i, theta, 0, 2*Math.PI, false)
            c.stroke()
        }

        // main stroke
        c.beginPath()
        c.ellipse(this.x, this.y, rX, rY, theta, 0, 2*Math.PI, false)
        c.strokeStyle = cfg.ballData.color
        c.lineWidth = cfg.ballData.lineWidth
        c.stroke()

        // ripple
        if (cfg.simData.hitEffect == 'ripple' || cfg.simData.hitEffect == 'both') {
            this.hitList.forEach(hit => {
                let rippleColor = cfg.rippleData.color.hexToRgbA()

                for (
                    let i = cfg.rippleData.opacityMax, w = cfg.rippleData.widthStart;
                    i > 0;
                    i -= cfg.rippleData.opacityStep, w += cfg.rippleData.widthStep
                ) {
                    c.beginPath()
                    c.ellipse(this.x, this.y, rX, rY, theta,
                              (hit.a - theta) - w,
                              (hit.a - theta) + w, false
                    )
                    rippleColor = rippleColor.setAlpha((hit.tR / cfg.rippleData.fadeTime) * i)
                    c.strokeStyle = rippleColor
                    c.stroke()
                }
            })
        }
    }

    update() {
        // first, update hit effectors
        const list = this.hitList
        for (let i = list.length - 1; i >= 0; i--) {
            if (list[i].tR > 0) {list[i].tR--}
            if (list[i].tB > 0) {list[i].tB--}
            if (list[i].tR + list[i].tB == 0) {list.splice(i, 1)}
        }
        
        // then, move according to velocity
        this.x += this.vel.x * cfg.ballData.speed
        this.y += this.vel.y * cfg.ballData.speed
        this.draw()
    }
}

const balls = []

function spawnBall() {
    let spawnX = Math.floor(Math.random() * canvas.width)
    let spawnY = Math.floor(Math.random() * canvas.height)
    const spawnAngle = Math.random() * (Math.PI * 2)

    const edgeChoice = ['n', 'e', 's', 'w'][Math.floor(Math.random() * 4)]

    if (edgeChoice == 'n') {spawnY = -limit}
    if (edgeChoice == 'e') {spawnX = canvas.width + limit}
    if (edgeChoice == 's') {spawnY = canvas.height + limit}
    if (edgeChoice == 'w') {spawnX = -limit}

    const ball = new Ball(
        spawnX,
        spawnY,
        cfg.ballData.radius,
        {
            x: Math.cos(spawnAngle),
            y: Math.sin(spawnAngle)
        }
    )
    balls.push(ball)
}

let maxHits = 0

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = cfg.simData.bgColor
    c.fillRect(0, 0, canvas.width, canvas.height)

    // physics here
    balls.forEach((ballA, indexA) => {
        balls.forEach((ballB, indexB) => {
            if (indexB > indexA) {
                const dist = Math.hypot(ballA.x - ballB.x, ballA.y - ballB.y)
                if (dist < cfg.ballData.radius * 2) {
                    const velA = ballA.vel
                    const norB = ballB.getNormal(ballA)
                    const uAB = VM.mult(norB, VM.dot(velA, norB))
                    ballA.vel = VM.sub(velA, VM.mult(uAB, 2))

                    const velB = ballB.vel
                    const norA = ballA.getNormal(ballB)
                    const uBA = VM.mult(norA, VM.dot(velB, norA))
                    ballB.vel = VM.sub(velB, VM.mult(uBA, 2))

                    if (ballA.hitList.length < 10) {
                        ballA.hitList.push({
                            a: Math.atan2(ballB.y - ballA.y, ballB.x - ballA.x),
                            tR: cfg.rippleData.fadeTime,
                            tB: cfg.bounceData.time
                        })
                    }
                    if (ballB.hitList.length < 10) {
                        ballB.hitList.push({
                            a: Math.atan2(ballA.y - ballB.y, ballA.x - ballB.x),
                            tR: cfg.rippleData.fadeTime,
                            tB: cfg.bounceData.time
                        })
                    }
                }
            }
        })
    })
    // end physics

    if (balls.length > 0) {
        balls.forEach((ball, index) => {
            ball.update()
            if (
                ball.x + limit < 0 ||
                ball.x - limit > canvas.width ||
                ball.y + limit < 0 ||
                ball.y - limit > canvas.height
            ) {
                balls.splice(index, 1)
            }
        })
    }
}

setInterval(() => {spawnBall()}, cfg.simData.spawnTime)
animate()