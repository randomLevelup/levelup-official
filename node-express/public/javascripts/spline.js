const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scale = {
    handleRadius: ((1 * Math.min(canvas.width, canvas.height)) / 45) - 9.8,
    handlePointWidth: ((1 * Math.min(canvas.width, canvas.height)) / 120) - 4,
    handleLineWidth: ((1 * Math.min(canvas.width, canvas.height)) / 240) - 2,
    splineWidth: ((1 * Math.min(canvas.width, canvas.height)) / 50) - 9.4
}
console.log(Math.min(canvas.width, canvas.height))
console.log(scale)

class VM { // simple abstract vector math class
    static get(p, q) {
        const result = [q[0]-p[0], q[1]-p[1]]
        return (result)
    }

    static scale(v, s) {
        const result = [v[0] * s, v[1] * s]
        return result
    }

    static add(u, v) {
        const result = [u[0] + v[0], u[1] + v[1]]
        return result
    }
}

class Spline {
    constructor() {
        this.pairs = []
    }

    movePoint(pair, point, x, y) {
        this.pairs[pair][point] = [x, y]
    }

    addPair(x, y) {
        this.pairs.push([[x, y], [x, y]])
        mode = ['movePoint', splines.length-1, this.pairs.length-1, 1]
    }

    draw() {
        this.pairs.forEach(pair => {
            c.strokeStyle = '#ebabc7'

            c.fillStyle = '#0F1123';
            [-1,1].forEach(flip => {                
                const difference = [pair[0][0] - pair[1][0],
                                    pair[0][1] - pair[1][1]]

                c.lineWidth = scale.handleLineWidth
                c.beginPath()
                c.moveTo(pair[0][0], pair[0][1])
                c.lineTo(pair[0][0] + (flip * difference[0]),
                         pair[0][1] + (flip * difference[1]))
                c.stroke()

                c.lineWidth = scale.handlePointWidth
                c.beginPath()
                c.arc(
                    pair[0][0] + (flip * difference[0]),
                    pair[0][1] + (flip * difference[1]),
                    scale.handleRadius, 0, (2*Math.PI), false
                )
                c.fill()
                c.stroke()
            })

            c.strokeStyle = '#A6F0C6'
            c.lineWidth = scale.splineWidth
            if (this.pairs.length > 1) {
                for (let i=1; i<this.pairs.length; i++) {
                    let inArr = [
                        this.pairs[i-1][0],
                        this.pairs[i-1][1],
                        [
                            this.pairs[i][0][0] - (this.pairs[i][1][0] - this.pairs[i][0][0]),
                            this.pairs[i][0][1] - (this.pairs[i][1][1] - this.pairs[i][0][1])
                        ],
                        this.pairs[i][0]
                    ]
                    c.beginPath()
                    c.moveTo(inArr[0][0], inArr[0][1])

                    const copyArr = [inArr[0], inArr[1], inArr[2], inArr[3]]
                    for (let t=0; t<=1; t+=(1/50)) { // resolution = 50 for now
                        while (inArr.length > 1) {
                            for (let j=1; j<inArr.length; j++) {
                                let vec = VM.get(inArr[j-1], inArr[j])
                                vec = VM.scale(vec, t)
                                inArr[j-1] = VM.add(inArr[j-1], vec)
                            }
                            inArr = inArr.slice(0, inArr.length-1)
                        }
                        c.lineTo(inArr[0][0], inArr[0][1])

                        inArr = copyArr
                    }
                    c.stroke()
                }
            }
            //

            c.beginPath()
            c.arc(pair[0][0], pair[0][1], 6, 0, (2*Math.PI), false)
            c.fillStyle = '#ebabc7'
            c.fill()
        })
    }
}

const splines = []
let mode = ['orbit'] // this is the default mode
// idk why i named it that it kinda makes sense
let activeSpline = false
let rightclicked = false

function touch(x, y) {
    if (!activeSpline) {
        let pointFound = false
        splines.forEach((spline, i) => {
            spline.pairs.forEach((pair, j) => {
                pair.forEach((point, k) => {
                    const distance = Math.hypot((x - point[0]), (y - point[1]))
                    if (distance < 10) {
                        pointFound = true
                        mode = ['movePoint', i, j, k]
                    }
                })
            })
        })
        if (!pointFound) {
            splines.push(new Spline())
            activeSpline = true
        }
    }
    if (activeSpline) {
        splines[splines.length-1].addPair(x, y)
    }
}

addEventListener("mousedown", event => {
    touch(event.clientX, event.clientY)
})
let doubleToggle = false
let doubleTimer = 0
addEventListener('touchstart', event => {
    event.preventDefault()
    if (doubleToggle) {
        activeSpline = false
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
    activeSpline = false
})

addEventListener('mouseup', event => {
    if (mode[0] = 'movePoint') {
        mode = ['orbit']
    }
})

addEventListener('mousemove', e => {
    if (mode[0] == 'movePoint') {
        splines[mode[1]].movePoint(mode[2], mode[3], e.clientX, e.clientY)
    }
})
addEventListener('touchmove', e => {
    if (mode[0] == 'movePoint') {
        splines[mode[1]].movePoint(mode[2], mode[3], e.touches[0].clientX, e.touches[0].clientY)
    }
})

function animate() {
    requestAnimationFrame(animate)

    doubleTimer += (doubleToggle) ? 1 : 0
    if (doubleTimer > 25) {doubleTimer = 0; doubleToggle = false}
    
    c.fillStyle = '#0F1123'
    c.fillRect(0, 0, canvas.width, canvas.height)

    splines.forEach(spline => {
        spline.draw()
    })
}

animate()