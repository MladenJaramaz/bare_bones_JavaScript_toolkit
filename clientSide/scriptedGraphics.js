'use strict';
/* ============================== SVG ============================== */
/**
* Create an <svg> element and draw a pie chart into it.
* Arguments:
* data: an array of numbers to chart, one for each wedge of the pie.
* width,height: the size of the SVG graphic, in pixels
* cx, cy, r: the center and radius of the pie
* colors: an array of HTML color strings, one for each wedge
* labels: an array of labels to appear in the legend, one for each wedge
* lx, ly: the upper-left corner of the chart legend
* Returns:
* An <svg> element that holds the pie chart.
* The caller must insert the returned element into the document.
*/
function pieChart(data, width, height, cx, cy, r, colors, labels, lx, ly) {
    // This is the XML namespace for svg elements
    const svgNamespace = 'http://www.w3.org/2000/svg';
    // Create the <svg> element, and specify pixel size and user coordinates
    const chart = document.createElementNS(svgNamespace, 'svg:svg');
    chart.setAttribute('width', width);
    chart.setAttribute('height', height);
    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    // Add up the data values so we know how big the pie is
    let total = 0;
    for(let i = 0; i < data.length; i++) total += data[i];
    // Now figure out how big each slice of pie is. Angles in radians.
    const angles = [];
    for(let i = 0; i < data.length; i++) angles[i] = data[i] / total * Math.PI * 2;
    // Loop through each slice of pie.
    let startAngle = 0;
    let endAngle;
    for(let i = 0; i < data.length; i++) {
        // This is where the wedge ends
        endAngle = startAngle + angles[i];
        // Compute the two points where our wedge intersects the circle
        // These formulas are chosen so that an angle of 0 is at 12 o'clock and positive angles increase clockwise.
        const x1 = cx + r * Math.sin(startAngle);
        const y1 = cy - r * Math.cos(startAngle);
        const x2 = cx + r * Math.sin(endAngle);
        const y2 = cy - r * Math.cos(endAngle);
        // This is a flag for angles larger than than a half circle, required by the SVG arc drawing component
        let big = 0;
        if (endAngle - startAngle > Math.PI) big = 1;
        // We describe a wedge with an <svg:path> element = notice that we create this with createElementNS()
        const path = document.createElementNS(svgNamespace, 'path');
        // This string holds the path details
        const pathData = 'M ' + cx + ',' + cy + // Start at circle center
        ' L ' + x1 + ',' + y1 + // Draw line to (x1,y1)
        ' A ' + r + ',' + r + // Draw an arc of radius r
        ' 0 ' + big + ' 1 ' + // Arc details...
        x2 + ',' + y2 + // Arc goes to to (x2,y2)
        ' Z'; // Close path back to (cx,cy)
        // Now set attributes on the <svg:path> element
        path.setAttribute('d', pathData); // Set this path
        path.setAttribute('fill', colors[i]); // Set wedge color
        path.setAttribute('stroke', 'black'); // Outline wedge in black
        path.setAttribute('stroke-width', '2'); // 2 units thick
        chart.appendChild(path); // Add wedge to chart
        // The next wedge begins where this one ends
        startAngle = endAngle;
        // Now draw a little matching square for the key
        const icon = document.createElementNS(svgNamespace, 'rect');
        icon.setAttribute('x', lx); // Position the square
        icon.setAttribute('y', ly + 30*i);
        icon.setAttribute('width', 20); // Size the square
        icon.setAttribute('height', 20);
        icon.setAttribute('fill', colors[i]); // Same fill color as wedge
        icon.setAttribute('stroke', 'black'); // Same outline, too.
        icon.setAttribute('stroke-width', '2');
        chart.appendChild(icon); // Add to the chart
        // And add a label to the right of the rectangle
        const label = document.createElementNS(svgNamespace, 'text');
        label.setAttribute('x', lx + 30); // Position the text
        label.setAttribute('y', ly + 30*i + 18);
        // Text style attributes could also be set via CSS
        label.setAttribute('font-family', 'sans-serif');
        label.setAttribute('font-size', '16');
        // Add a DOM text node to the <svg:text> element
        label.appendChild(document.createTextNode(labels[i]));
        chart.appendChild(label); // Add text to the chart
    }
    return chart;
}
/* ============================== Canvas ============================== */
// Revert to the last saved graphics state, but don't pop the stack.
CanvasRenderingContext2D.prototype.revert = function() {

    this.restore(); // Restore the old graphics state.
    this.save(); // Save it again so we can go back to it.
    return this; // Allow method chaining.
};
// Set the graphics attributes specified by the properties of the object obj.
// Or, if no argument is passed, return the current attributes as an object.
// Note that this does not handle the transformation or clipping region.
CanvasRenderingContext2D.prototype.attrs = function(obj) {

    if (obj) {
        for(let a in obj) this[a] = obj[a]; // For each property in obj, Set it as a graphics attribute
        return this; // Enable method chaining
    }
    else return {
        fillStyle: this.fillStyle, font: this.font,
        globalAlpha: this.globalAlpha,
        globalCompositeOperation: this.globalCompositeOperation,
        lineCap: this.lineCap, lineJoin: this.lineJoin,
        lineWidth: this.lineWidth, miterLimit: this.miterLimit,
        textAlign: this.textAlign, textBaseline: this.textBaseline,
        shadowBlur: this.shadowBlur, shadowColor: this.shadowColor,
        shadowOffsetX: this.shadowOffsetX, shadowOffsetY: this.shadowOffsetY,
        strokeStyle: this.strokeStyle
    };
};
// Define a regular polygon with n sides, centered at (x,y) with radius r.
// The vertices are equally spaced along the circumference of a circle.
// Put the first vertex straight up or at the specified angle.
// Rotate clockwise, unless the counterclockwise argument is true.
function polygon(id, n, x, y, r, angle, counterclockwise, fillColor, strokeColor, lineWidth) {

    const canvas = document.getElementById(id);
    const context = canvas.getContext('2d');
    angle = angle || 0;
    counterclockwise = counterclockwise || false;
    // Start a new path and add polygon subpaths
    context.beginPath();
    // Begin a new subpath at the first vertex
    // Use trigonometry to compute position
    context.moveTo(x + r * Math.sin(angle), y - r * Math.cos(angle)); 
    const delta = 2 * Math.PI / n; // Angular distance between vertices
    for(let i = 1; i < n; i++) { // For each of the remaining vertices
        angle += counterclockwise ? -delta : delta; // Adjust angle
        context.lineTo(x + r * Math.sin(angle), y - r * Math.cos(angle)); // Add line to next vertex
    }
    context.closePath(); // Connect last vertex back to the first
    // Set some properties that control how the graphics will look
    context.fillStyle = fillColor;
    context.strokeStyle = strokeColor; 
    context.lineWidth = lineWidth; 
    // Now draw all the polygons (each in its own subpath) with these calls
    context.fill(); // Fill the shapes
    context.stroke(); // And stroke their outlines
}
// Draw a level-n Koch Snowflake fractal on the canvas context c,
// with lower-left corner at (x,y) and side length len.
function snowflake(id, n, x, y, len) {

    const deg = Math.PI / 180; // convert degrees to radians
    const canvas = document.getElementById(id);
    const context = canvas.getContext('2d');
    context.save(); // Save current transformation
    context.translate(x, y); // Translate origin to starting point
    context.moveTo(0, 0); // Begin a new subpath at the new origin
    leg(n); // Draw the first leg of the snowflake
    context.rotate(-120 * deg); // Now rotate 120 degrees counterclockwise
    leg(n); // Draw the second leg
    context.rotate(-120 * deg); // Rotate again
    leg(n); // Draw the final leg
    context.closePath(); // Close the subpath
    context.restore(); // And restore original transformation
    context.stroke(); // Stroke this very complicated path
    // Draw a single leg of a level-n Koch snowflake.
    // This function leaves the current point at the end of the leg it has
    // drawn and translates the coordinate system so the current point is (0,0).
    // This means you can easily call rotate() after drawing a leg.
    function leg(n) {

        context.save(); // Save the current transformation
        if (n == 0) context.lineTo(len, 0); // Nonrecursive case: just draw a horizontal line
        else { // Recursive case: draw 4 sub-legs like: \/
            context.scale(1/3, 1/3); // Sub-legs are 1/3rd the size of this leg
            leg(n - 1); // Recurse for the first sub-leg
            context.rotate(60 * deg); // Turn 60 degrees clockwise
            leg(n - 1); // Second sub-leg
            context.rotate(-120 * deg); // Rotate 120 degrees back
            leg(n - 1); // Third sub-leg
            context.rotate(60 * deg); // Rotate back to our original heading
            leg(n - 1); // Final sub-leg
        }
        context.restore(); // Restore the transformation
        context.translate(len, 0); // But translate to make end of leg (0,0)
    }
}



// A utility function to convert angles from degrees to radians
function rads(x) { return Math.PI*x/180; }
// Draw a circle. Scale and rotate if you want an ellipse instead.
// There is no current point, so draw just the circle with no straight
// line from the current point to the start of the circle.
c.beginPath();
c.arc(75,100,50, // Center at (75,100), radius 50
0,rads(360),false); // Go clockwise from 0 to 360 degrees
// Draw a wedge. Angles are measured clockwise from the positive x axis.
// Note that arc() adds a line from the current point to the arc start.
c.moveTo(200, 100); // Start at the center of the circle
c.arc(200, 100, 50, // Circle center and radius
rads(-60), rads(0), // start at angle -60 and go to angle 0
false); // false means clockwise
c.closePath(); // Add radius back to the center of the circle
// Same wedge, opposite direction
c.moveTo(325, 100);
c.arc(325, 100, 50, rads(-60), rads(0), true); // counterclockwise
c.closePath();
// Use arcTo() for rounded corners. Here we draw a square with
// upper left corner at (400,50) and corners of varying radii.
c.moveTo(450, 50); // Begin in the middle of the top edge.
c.arcTo(500,50,500,150,30); // Add part of top edge and upper right corner.
c.arcTo(500,150,400,150,20); // Add right edge and lower right corner.
c.arcTo(400,150,400,50,10); // Add bottom edge and lower left corner.
c.arcTo(400,50,500,50,0); // Add left edge and upper left corner.
c.closePath(); // Close path to add the rest of the top edge.
// Quadratic Bezier curve: one control point
c.moveTo(75, 250); // Begin at (75,250)
c.quadraticCurveTo(100,200, 175, 250); // Curve to (175,250)
c.fillRect(100-3,200-3,6,6); // Mark the control point (100,200)
// Cubic Bezier curve
c.moveTo(200, 250); // Start at (200,250)
c.bezierCurveTo(220,220,280,280,300,250); // Curve to (300,250)
c.fillRect(220-3,220-3,6,6); // Mark control points
c.fillRect(280-3,280-3,6,6);
// Define some graphics attributes and draw the curves
c.fillStyle = "#aaa"; // Gray fills
c.lineWidth = 5; // 5-pixel black (by default) lines
c.fill(); // Fill the curves
c.stroke(); // Stroke their outlines

