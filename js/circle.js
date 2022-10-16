// taken from: https://editor.p5js.org/kjhollen/sketches/By6ZdQo3-
function Circle(inX, inY, r = 8) {
    this.x = inX;
    this.y = inY;
    this.r = r;
    this.col = color(255);

    this.mouseOver = function() {
        const newX = Controls.zoom(controls).worldToScreen(this.x, this.y)["x"];
        const newY = Controls.zoom(controls).worldToScreen(this.x, this.y)["y"];
        return dist(newX, newY, mouseX, mouseY) < this.r;
    }

    this.display = function () {
        if (this.mouseOver()) {
            this.col = color(255, 0, 255);
        } else {
            this.col = color(255);
        }
        fill(this.col);
        ellipse(this.x, this.y, this.r * 2, this.r * 2);
    }
}