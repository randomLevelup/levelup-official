const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Spline {
    constructor(x, y) {
        this.pairs = [
            [[x, y], [x, y]]
        ]
    }
    /**draw function:
     *  draw handle lines
     *  draw handle endpoints
     *  draw curve lines
     *  draw curve endpoints
     */
}

const splines = []
const mode = 'orbit' // this is the default mode
// idk why i named it that it kinda makes sense
const activeSpline = false

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

/**On rightClick:
 *  if mouse is over handle:
 *      reset handle method
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

/**Animate Frames:
 *  theres a better way, but for now:
 *  fill frame with black
 *  foreach splines:
 *      spline.draw()
 */
