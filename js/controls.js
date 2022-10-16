// everything related to zooming and scrolling around canvas is taken from: https://editor.p5js.org/Kubi/sketches/36dfCG35j
const controls = {
    view: {
        x: 0,
        y: 0,
        zoom: 1
    },
    viewPos: {
        prevX: null,
        prevY: null,
        isDragging: false
    },
}

class Controls {
    static move(controls) {

        function mousePressed(e) {
            controls.viewPos.isDragging = true;
            controls.viewPos.prevX = e.clientX;
            controls.viewPos.prevY = e.clientY;

            // check to see if hovering over node --> display information
            Object.values(g.vertices).forEach(v => {
                if (circles[v.data].mouseOver()) {
                    displayNode(v);
                }
            })
        }

        function mouseDragged(e) {
            const {
                prevX,
                prevY,
                isDragging
            } = controls.viewPos;
            if (!isDragging) return;

            const pos = {
                x: e.clientX,
                y: e.clientY
            };
            const dx = pos.x - prevX;
            const dy = pos.y - prevY;

            if (prevX || prevY) {
                controls.view.x += dx;
                controls.view.y += dy;
                controls.viewPos.prevX = pos.x, controls.viewPos.prevY = pos.y
            }
        }

        function mouseReleased(e) {
            controls.viewPos.isDragging = false;
            controls.viewPos.prevX = null;
            controls.viewPos.prevY = null;
        }

        return {
            mousePressed,
            mouseDragged,
            mouseReleased
        }
    }

    static zoom(controls) {
        function screenToWorld(x, y) {
            const newX = x / controls.view.zoom + controls.view.x;
            const newY = x / controls.view.zoom + controls.view.x;
            return {
                x: newX,
                y: newY
            };
        }

        function worldToScreen(x, y) {
            const newX = (x + controls.view.x) * controls.view.zoom;
            const newY = (y + controls.view.y) * controls.view.zoom;
            return {
                x: newX,
                y: newY
            };
        }

        function worldZoom(e) {
            const {
                x,
                y,
                deltaY
            } = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.05;
            const zoom = 1 * direction * factor;

            const wx = (x - controls.view.x) / (controls.view.zoom);
            const wy = (y - controls.view.y) / (controls.view.zoom);

            controls.view.x -= wx * zoom;
            controls.view.y -= wy * zoom;
            controls.view.zoom += zoom;
        }

        return {
            worldZoom,
            screenToWorld,
            worldToScreen
        }
    }
}

function displayNode(node) {
    const display_out = document.getElementById('node-display');
    display_out.style["display"] = "flex";
    const display = document.getElementById('node-display-inner');
    display.innerHTML = "";
    // displaying data
    display.appendChild(createSpanLeft("data: "));
    display.appendChild(createSpanRight(node.data));
    display.appendChild(createSpanLeft("degree: "));
    display.appendChild(createSpanRight(node.mass));
    display.appendChild(createSpanLeft("number of connections: "));
    display.appendChild(createSpanRight(node.edgesLeaving.length));
    display.appendChild(createSpanLeft("top connections: "));
    display.appendChild(createSpanRight(""));
    // get top five connections
    node.edgesLeaving.sort(function (a, b) {
        b.weight - a.weight;
    })
    let edges;
    if (node.edgesLeaving.length >= 5) edges = node.edgesLeaving.slice(0, 5);
    else edges = node.edgesLeaving;
    // add top five connections to display
    edges.forEach(e => {
        display.appendChild(createSpanRight("target: " + e.target.data + "; " + "weight: " + e.weight))
    })

    function createSpanLeft(text) {
        const sl = document.createElement('span');
        sl.innerHTML = text;
        sl.classList.add('node-sl');
        return sl;
    }

    function createSpanRight(text) {
        const sr = document.createElement('span');
        sr.innerHTML = text + "<br />";
        sr.classList.add('node-sr');
        return sr;
    }
}

// make close button close the node display
const closeButton = document.getElementById('close-node');
closeButton.onclick = function () {
    const display_out = document.getElementById('node-display');
    display_out.style["display"] = "none";
}