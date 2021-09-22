const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Spline {
    constructor(x, y) {
        this.pairs = []
        this.addPair(x, y)
    }
    /**movePoint function:
     * takes pair number, point selector, x, and y
     * updates the correct pair to the new x and y (maybe relative?)
     */

    /**addPair function:
     * takes x and y for endpoint pos
     * creates a new pair with these values
     * updates mode to ['movePoint' splines.length-1, this.pairs.length-1, 1]
     * IMPORTANT ^^
     */

    /**draw function:
     *  draw handle lines
     *  draw handle endpoints
     *  draw curve lines
     *  draw curve endpoints
     */
}

const splines = []
let mode = ['orbit'] // this is the default mode
// idk why i named it that it kinda makes sense
let activeSpline = false
let rightclicked = false

/**On leftClick:
 *  if mouse is over endpoint or handle:
 *      begin moveEndpoint / moveHandle mode
 * 
 *  if mouse is over nothing:
 *      if a spline is active:
 *          add pair at mousepos,
 *          begin movehandle mode
 * 
 *      if no spline is active:
 *          create new spline using constructor
 */
addEventListener("click", e => {
    let pointFound = false
    splines.forEach(spline, i => {
        spline.pairs.forEach(pair, j => {
            pair.forEach(point, k => {
                distance = Math.abs(Math.hypot((e.clientX - point[0]), (e.clientX - point[1])))
                if (distance < 10) {
                    pointFound = true
                    mode = ['movePoint', i, j, k]
                }
            })
        })
    })

    if (!pointFound) {
        if (activeSpline) {
            splines[-1].addPair()
        }
        else {
            splines.push(new Spline(e.clientX, e.clientY))
        }
    }
});


/**On rightClick:
 *  if mouse is over handle:
 *      reset handle method (ACTUALLY DONT REALLY NEED THIS)
 * 
 *  if mouse is over endpoint:
 *      splice pair from spline
 * 
 *  if mouse is over nothing:
 *      if a spline is active:
 *          deactivate the spline
 */

/**On mouseUp:
 *  if mode = moveEndpoint / moveHandle:
 *      exit the mode:
 *  
 */

/**On mouseMove:
 *  if mode == movePoint:
 *      splines[mode[1]].movePoint(mode[2],mode[3], x, y)
 */

/**Animate Frames:
 *  theres a better way, but for now:
 *  fill frame with black
 *  foreach splines:
 *      spline.draw()
 */
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
}

animate()