'use strict';
// replace a Text Node with a <b> element containing the text of the Text Node 
function emboldenTextNode(textNode) {

    const parentElement = textNode.parentNode;
    const bElement = document.createElement('b');
    bElement.textContent = textNode.nodeValue;
    parentElement.replaceChild(bElement, textNode);
}
// scale the text of the element by specified factor, in specified duration
// if fourth argument is provided it will be treated like a callback
function scaleText(element, factor, duration, callback) {
    // handle arguments
    if (typeof element === 'string') element = document.getElementById(element);
    factor = Number(factor);
    duration = Number(duration);
    if (isNaN(factor)) factor = 1.5;
    if (isNaN(duration)) duration = 500;
    if (typeof callback !== 'function') callback = function(){console.log('scale text animation complete')};
    
    const originalFontSize = window.getComputedStyle(element).fontSize; // get the original font size
    const startTime = Date.now();
    animate();

    function animate() {
        const progress = (Date.now() - startTime) / duration; // calculate the progress of the animation
        if (progress < 1) {
            const newFontSize = parseFloat(originalFontSize) * (1 + (factor - 1) * progress); // calculate the new font size
            element.style.fontSize = newFontSize + 'px'; // set the new font size
            setTimeout(animate, 25); // request the next frame of the animation
        } else {
            element.style.fontSize = parseFloat(originalFontSize) * factor + 'px'; // ensure the final font size is correct
            callback();
        }
    }
}  
// convert element to relative position and add animation
// first argument is the element object or element id
// second argument defines the length of the animation, if not present it defaults to 5px
// third argument defines the duration of the animation, if not present it defaults to 500ms
// if fourth argument is provided it will be treated like a callback
function shake (element, distance, duration, callback) {
    // handle arguments
    if (typeof element === 'string') element = document.getElementById(element);
    distance = Number(distance);
    duration = Number(duration);
    if (isNaN(distance)) distance = 5;
    if (isNaN(duration)) duration = 500;
    if (typeof callback !== 'function') callback = function(){console.log('shake animation complete')};

    const originalStyeAttribute = element.style.cssText; // save the original style attribute
    element.style.position = 'relative'; // set the position of the element to relative
    const startTime = Date.now(); // get the current time
    animate(); // start the animation

    function animate() {   

        const progress = (Date.now() - startTime) / duration; // calculate the progress of the animation
        if (progress < 1) {
            const offset = Math.sin(progress * Math.PI * 2) * distance; // calculate the offset of the element
            element.style.left = offset + 'px'; // set the left position of the element
            // aim for a smooth animation of 40 frames per second
            setTimeout(animate, 25); // request the next frame of the animation
        } else {
            element.style.cssText = originalStyeAttribute; // restore the original style attribute
            callback(); // call the callback function 
        }
    }
}
// fade an element from fully opaque to fully transparent over specified duration
// assume element is fully opaque at the start
// if third argument is provided it will be treated like a callback
function fadeOut(element, duration, callback) {
    // handle arguments
    if (typeof element === 'string') element = document.getElementById(element);
    duration = Number(duration);
    if (isNaN(duration)) duration = 500;
    if (typeof callback !== 'function') callback = function(){console.log('fade out animation complete')};

    const ease = Math.sqrt; // ease function for smooth transition: fading quickly at first, then slowing down
    const startTime = Date.now();
    animate();

    function animate() {

        const progress = (Date.now() - startTime) / duration; // calculate the progress of the animation
        if (progress < 1) {
            element.style.opacity = String(1 - ease(progress)); // calculate and apply the opacity of the element
            setTimeout(animate, 25); // request the next frame of the animation
        } else {
            element.style.opacity = '0'; // ensure the element is fully transparent at the end
            callback();
        }
    }
}
// alter background color of an element by the specified percentage over a period of time
// second argument is the factor: factor > 0 will increase the brightness, factor < 0 will decrease it
// if fourth argument is provided it will be treated like a callback
function scaleBackgroundColor(element, factor, duration, callback) {
    // handle arguments
    if (typeof element === 'string') element = document.getElementById(element);
    duration = Number(duration);
    factor = Number(factor) / 100;
    if (isNaN(duration)) duration = 500;
    if (isNaN(factor)) factor = -0.5;
    if (typeof callback !== 'function') callback = function(){console.log('scale background color animation complete')};

    const originalBackgroundColor = window.getComputedStyle(element).backgroundColor;
    const individualColorValues = originalBackgroundColor.replace('rgb(', '').replace('rgba(', '').replace(')', '')
                                .split(','); // extract RGBA values from the background color
    let alpha;
    if (individualColorValues.length === 3) alpha = 1; // if the color is RGB, set alpha to 1
    else if (individualColorValues.length === 4) { 
        alpha = Number(individualColorValues[3]); // if the color is RGBA, extract alpha value
        delete individualColorValues[3]; // remove alpha value from the array
    }
    const rgbValues = `${individualColorValues[0]}, ${individualColorValues[1]}, ${individualColorValues[2]}, `;
    let goalAlpha = alpha + alpha * factor;
    if (goalAlpha < 0) goalAlpha = 0; // ensure alpha does not go below 0
    if (goalAlpha > 1) goalAlpha = 1; // ensure alpha does not go above 1
    const alphaChange = goalAlpha - alpha; // calculate the change in alpha
    const startTime = Date.now();
    animate();

    function animate() {

        const progress = (Date.now() - startTime) / duration; // calculate the progress of the animation
        if (progress < 1) {
            const newAlpha = alpha + alphaChange * progress; // calculate the new alpha value
            console.log(rgbValues, newAlpha)
            element.style.backgroundColor = `rgba(${rgbValues} ${newAlpha})`; // set the new background color
            setTimeout(animate, 25); // request the next frame of the animation
        } else {
            element.style.backgroundColor = `rgba(${rgbValues} ${goalAlpha})`; // ensure the final background color is correct
            callback();
        }
    }
}
// add a new stylesheet to the document and populate it with the provided CSS rules
// if rules argument is a string, it will be treated as the CSS rules
// if rules argument is an object, it will be treated as a map of selectors to CSS rules
function addStylesheet(rules) {

    const style = document.createElement('style');
    style.type = 'text/css';
    document.head.appendChild(style);
    if (typeof rules === 'string') {
        style.appendChild(document.createTextNode(rules));
    } else if (typeof rules === 'object') {
        let styleString = '';
        for (const selector in rules) {
            styleString += `${selector} {`;
            const selectorRules = rules[selector];
            for (const propertyKey in selectorRules) { 
                styleString += `${propertyKey}: ${selectorRules[propertyKey]};`;
            }
            styleString += `} `;
        }
        style.appendChild(document.createTextNode(styleString));
    }
}
// function that disables selected stylesheet
// if passed a number, it will disable the stylesheet at that index in document.styleSheets
// if passed a string, it will disable the stylesheet with that id
function disableStylesheet(stylesheet) {

    if (typeof stylesheet === 'number') {
        if (stylesheet < 0 || stylesheet >= document.styleSheets.length) {
            console.error('Invalid stylesheet index');
            return;
        }
        document.styleSheets[stylesheet].disabled = true;
    } else if (typeof stylesheet === 'string') {
        const styleSheet = document.getElementById(stylesheet);
        if (!styleSheet) {
            console.error(`Stylesheet with id '${stylesheet}' not found`);
            return;
        }
        styleSheet.disabled = true;
    } else {
        console.error('Invalid argument: must be a number or a string');
    }
}
