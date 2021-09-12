const drawArr = {
    w: [{x: -1, y: 1}, {x: -1, y: -1}],
    e: [{x: 1, y: -1}, {x: 1, y: 1}],
    n: [{x: -1, y: -1}, {x: 1, y: -1}],
    s: [{x: 1, y: 1}, {x: -1, y: 1}],
}

const padding = {x: 200, y: 100}
const cellWidth = 35

const mazeSize = 15
var dirKeys = ['w', 'e', 'n', 's']
var dirDict = {
    w: {
        x: -1,
        y: 0
    },
    e: {
        x: 1,
        y: 0
    },
    n: {
        x: 0,
        y: -1
    },
    s: {
        x: 0,
        y: 1
    }
}

var grid // base grid
var ant // creates pathways between cells
var log // logs ant's positions for backtracing

const traceArr = []
const maxTime = 15
const trailLength = 20

const wasdImg = document.getElementById('wasd')
const generateImg = document.getElementById('generate')

var buttonFade = false
var buttonGradient = 0
var player