const circles = {};
let canvas;
const g = loadGraph(hp4_small);
const width = window.innerWidth;
const height = window.innerHeight;

function setup() {
    textAlign(LEFT);
    frameRate(60);
    canvas = createCanvas(width, height);
    canvas.mouseWheel(e => Controls.zoom(controls).worldZoom(e));
    // make circles
    Object.values(g.vertices).forEach(v => {
        circles[v.data] = new Circle(0, 0, r = 8 * (Math.log(Math.floor(v.mass + 1)) + 1));
    })
}

function draw() {
    translate(controls.view.x, controls.view.y);
    scale(controls.view.zoom);
    background(90);
    // draw edges
    stroke(255);
    strokeWeight(1); // set defualt thickness to 1
    Object.values(g.vertices).forEach(v => {
        v.edgesLeaving.forEach(e => {
            // base thickness on log scale
            strokeWeight(Math.sqrt(e.weight)/3 + 1);
            fill([255, 0, 0]);
            line(v.position[0] + width / 2, v.position[1] + height / 2, e.target.position[0] + width / 2, e.target.position[1] + height / 2)
        })
    })
    // reset thickness
    strokeWeight(1);
    // draw circles
    stroke(0);
    Object.values(g.vertices).forEach(v => {
        const i = v.data;
        circles[i].x = width / 2 + g.vertices[i].position[0];
        circles[i].y = height / 2 + g.vertices[i].position[1];
        circles[i].display();
        // add text if the circle is big enough
        text(v.data, width / 2 + g.vertices[i].position[0], height / 2 + g.vertices[i].position[1]);
    })
    g.updatePositions(0.5, 20 + Math.log10(g.numEdges + 1), 200000 * g.numEdges / Object.values(g.vertices).length, 1);
}

window.mousePressed = e => Controls.move(controls).mousePressed(e)
window.mouseDragged = e => Controls.move(controls).mouseDragged(e);
window.mouseReleased = e => Controls.move(controls).mouseReleased(e)