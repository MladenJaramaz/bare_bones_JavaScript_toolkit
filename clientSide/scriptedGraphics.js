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
// Define a regular polygon with n sides, centered at (x,y) with radius r.
// The vertices are equally spaced along the circumference of a circle.
// Put the first vertex straight up or at the specified angle.
// Rotate clockwise, unless the last argument is true.
function polygon(c,n,x,y,r,angle,counterclockwise) {
    var canvas = document.getElementById("my_canvas_id");
var c = canvas.getContext('2d');
angle = angle || 0;
counterclockwise = counterclockwise || false;
c.moveTo(x + r*Math.sin(angle), // Begin a new subpath at the first vertex
y - r*Math.cos(angle)); // Use trigonometry to compute position
var delta = 2*Math.PI/n; // Angular distance between vertices
for(var i = 1; i < n; i++) { // For each of the remaining vertices
angle += counterclockwise?-delta:delta; // Adjust angle
c.lineTo(x + r*Math.sin(angle), // Add line to next vertex
y - r*Math.cos(angle));
}
c.closePath(); // Connect last vertex back to the first
}
// Start a new path and add polygon subpaths
c.beginPath();
polygon(c, 3, 50, 70, 50); // Triangle
polygon(c, 4, 150, 60, 50, Math.PI/4); // Square
polygon(c, 5, 255, 55, 50); // Pentagon
polygon(c, 6, 365, 53, 50, Math.PI/6); // Hexagon
polygon(c, 4, 365, 53, 20, Math.PI/4, true); // Small square inside the hexagon
// Set some properties that control how the graphics will look
c.fillStyle = "#ccc"; // Light gray interiors
c.strokeStyle = "#008"; // outlined with dark blue lines
c.lineWidth = 5; // five pixels wide.
// Now draw all the polygons (each in its own subpath) with these calls
c.fill(); // Fill the shapes
c.stroke(); // And stroke their outlines




// Revert to the last saved graphics state, but don't pop the stack.
CanvasRenderingContext2D.prototype.revert = function() {
this.restore(); // Restore the old graphics state.
this.save(); // Save it again so we can go back to it.
return this; // Allow method chaining.
};
// Set the graphics attributes specified by the properties of the object o.
// Or, if no argument is passed, return the current attributes as an object.
// Note that this does not handle the transformation or clipping region.
CanvasRenderingContext2D.prototype.attrs = function(o) {
if (o) {
for(var a in o) // For each property in o
this[a] = o[a]; // Set it as a graphics attribute
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



var deg = Math.PI/180; // For converting degrees to radians
// Draw a level-n Koch Snowflake fractal on the canvas context c,
// with lower-left corner at (x,y) and side length len.
function snowflake(c, n, x, y, len) {
c.save(); // Save current transformation
c.translate(x,y); // Translate origin to starting point
c.moveTo(0,0); // Begin a new subpath at the new origin
leg(n); // Draw the first leg of the snowflake
c.rotate(-120*deg); // Now rotate 120 degrees counterclockwise
leg(n); // Draw the second leg
c.rotate(-120*deg); // Rotate again
leg(n); // Draw the final leg
c.closePath(); // Close the subpath
c.restore(); // And restore original transformation
// Draw a single leg of a level-n Koch snowflake.
// This function leaves the current point at the end of the leg it has
// drawn and translates the coordinate system so the current point is (0,0).
// This means you can easily call rotate() after drawing a leg.
function leg(n) {
c.save(); // Save the current transformation
if (n == 0) { // Nonrecursive case:
c.lineTo(len, 0); // Just draw a horizontal line
} // _ _
else { // Recursive case: draw 4 sub-legs like: \/
c.scale(1/3,1/3); // Sub-legs are 1/3rd the size of this leg
leg(n-1); // Recurse for the first sub-leg
c.rotate(60*deg); // Turn 60 degrees clockwise
leg(n-1); // Second sub-leg
c.rotate(-120*deg); // Rotate 120 degrees back
leg(n-1); // Third sub-leg
c.rotate(60*deg); // Rotate back to our original heading
leg(n-1); // Final sub-leg
}
c.restore(); // Restore the transformation
c.translate(len, 0); // But translate to make end of leg (0,0)
}
}
snowflake(c,0,5,115,125); // A level-0 snowflake is an equilateral triangle
snowflake(c,1,145,115,125); // A level-1 snowflake is a 6-sided star
snowflake(c,2,285,115,125); // etc.
snowflake(c,3,425,115,125);
snowflake(c,4,565,115,125); // A level-4 snowflake looks like a snowflake!
c.stroke(); // Stroke this very complicated path
