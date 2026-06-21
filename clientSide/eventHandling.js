'use strict';
// pass a function to whenReady() and it will be invoked when the DOM is ready for manipulation
// if the DOM is already ready when whenReady() is invoked, the function will be invoked immediately
const whenReady = (function() {
    
    let funcs = []; // array of functions to be invoked when DOM is ready
    let ready = false; // true if DOM is ready for manipulation
    // handler() is invoked when DOM is ready for manipulation and its invocation invokes all functions in functions array
    function handler(event) {

        if (ready) return;
        // if function got invoked on 'readystatechange' event and state changed to something other than 'complete', do nothing
        if (event === 'readystatechange' && document.readyState !== 'complete') return;
        ready = true;
        // run all the registered functions
        for (let i = 0; i < funcs.length; i++) funcs[i].call(document);
        funcs = null;
    }
    // register a function to be invoked when DOM is ready for manipulation
    document.addEventListener('DOMContentLoaded', handler, false);
    document.addEventListener('readystatechange', handler, false);
    window.addEventListener('load', handler, false);
    // return whenReady function
    return function whenReady(func) {
        
        if (ready) func.call(document);
        else funcs.push(func);
    }
}());
// drag() is designed to be used as an event handler for a onmousedown event
// subsequent mousemove events are used to drag an element around the screen
// mouseup event will terminate the drag operation
// first argument is an element that has to be absolutely positioned
// second argument is the Event object of the mousedown event
function drag(event) {
    
    const elementToDrag = this.parentNode;
    const elementToDragRect = elementToDrag.getBoundingClientRect();
    const pageXOffset = window.pageXOffset;
    const pageYOffset = window.pageYOffset;
    // initial mouse position, converted to document coordinates
    const mouseStartX = event.clientX + pageXOffset;
    const mouseStartY = event.clientY + pageYOffset;
    // initial elementToDrag position, converted to document coordinates
    const elementToDragStartX = elementToDragRect.left + pageXOffset;
    const elementToDragStartY = elementToDragRect.top + pageYOffset;
    // compute distance between initial mouse position and initial elementToDrag position
    const deltaX = elementToDragStartX - mouseStartX;
    const deltaY = elementToDragStartY - mouseStartY;
    // register mousemove and mouseup event handlers on the document as capturing event handlers
    document.addEventListener('mousemove', mouseMoveHandler, true);
    document.addEventListener('mouseup', mouseUpHandler, true);
    // cancel bubbling and prevent any default behavior
    event.stopPropagation();
    event.preventDefault();
    function mouseMoveHandler(event) {
        
        elementToDrag.style.left = (event.clientX + window.pageXOffset + deltaX) + 'px';
        elementToDrag.style.top = (event.clientY + window.pageYOffset + deltaY) + 'px';   
        event.stopPropagation();
    }
    function mouseUpHandler(event) {
        // remove capturing mousemove and mouseup event handlers on the document
        document.removeEventListener('mousemove', mouseMoveHandler, true);
        document.removeEventListener('mouseup', mouseUpHandler, true);
        event.stopPropagation();
    }
}
// enclose content element in a frame of predefined width and height (50x50 minimum by default)
// optional offsetX and offsetY arguments are used to position the frame relative to the content element
// frame has mouse event handlers that allow user to scroll content, pan the element or shrink / enlarge it
function enclose(contentElement, frameWidth, frameHeight, offsetX, offsetY) {
    
    frameWidth = frameWidth || 50;
    frameHeight = frameHeight || 50;
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    // frame styling
    const frame = document.createElement('div');
    frame.className = 'enclosure';
    frame.style.width = frameWidth + 'px';
    frame.style.height = frameHeight + 'px';
    frame.style.boxSizing = 'border-box';
    frame.style.overflow = 'hidden';

    contentElement.parentNode.insertBefore(frame, contentElement);
    frame.appendChild(contentElement);
    // position content element inside frame
    contentElement.style.position = 'relative';
    contentElement.style.left = offsetX + 'px';
    contentElement.style.top = offsetY + 'px';
    
    frame.addEventListener('wheel', wheelHandler, false);
    function wheelHandler(event) {
        // extract amount of scrolling from event object (both in 1D and 2D)
        // scale deltas so that 1 click towards the screen is 30 pixels
        const deltaX = event.deltaX * 30;
        const deltaY = event.deltaY * 30;
        
        const contentBox = contentElement.getBoundingClientRect();
        const contentWidth = contentBox.width;
        const contentHeight = contentBox.height;
        if (event.altKey) {
            // if alt key is pressed, resize the frame
            frameWidth -= deltaX;
            // width can not be less than 50 and no bigger than content width
            frameWidth = Math.max(50, Math.min(contentWidth, frameWidth));
            frame.style.width = frameWidth + 'px';
            frameHeight -= deltaY;
            // height can not be less than 50 and no bigger than content height
            frameHeight = Math.max(50, Math.min(contentHeight, frameHeight));
            frame.style.height = frameHeight + 'px';
        } else {
            // if alt key is not pressed, pan the element within the frame
            const minOffsetX = Math.min(frameWidth - contentWidth, 0);
            // add deltaX to content offset, but do not exceed minOffsetX
            const contentX = Math.min(offsetX + deltaX, minOffsetX);
            contentElement.style.left = contentX + 'px';
            const minOffsetY = Math.min(frameHeight - contentHeight, 0);
            // add deltaY to content offset, but do not exceed minOffsetY
            const contentY = Math.min(offsetY+ deltaY, minOffsetY);
            contentElement.style.top = contentY + 'px';
        }
        // cancel bubbling and prevent any default behavior
        // this stop browser from scrolling the window on wheel event
        event.stopPropagation();
        event.preventDefault();
    }
}
// display time in hh:mm format inside the clock, update once in a minute
// make the clock a custom drag source
whenReady(function() {

    const clock = document.getElementById('clock');
    const icon = new Image();
    icon.srcset = 'clock.png';

    function displayTime() {

        const now = new Date();
        const hours = now.getHours();
        let minutes = now.getMinutes();
        if (minutes < 10) minutes = `0${minutes}`;
        clock.innerHTML = `${hours}:${minutes}`;
        setTimeout(displayTime, 60000); 
    }
    displayTime();
    // next line makes the clock draggable, same could be done with draggable='true' HTML attribute
    clock.draggable = true;
    clock.ondragstart = function(event) {
        // dataTransfer as a key property for DnD API
        const dt = event.dataTransfer;
        // tell browser what is being dragged
        dt.setData('Text', `${Date()}\n`);
        // tell the browser to drag the icon representing the timestamp
        if (dt.setDragImage) dt.setDragImage(icon, 0, 0);
    };
});
// a cross-browser solution to DnD event handling
whenReady(function() {
    // find all lists with 'dnd' in their class name and call dnd() on them
    const lists = document.getElementsByTagName('ul');
    const listCount = lists.length;
    const regExp = /\bdnd\b/;
    for (let i = 0; i < listCount; i++) {
        const list = lists[i];
        if (regExp.test(list.className)) dnd(list);
    }
    // add DnD handlers to a list element
    function dnd(list) {
        // make all items originally in the list draggable
        const items = list.getElementsByTagName('li');
        const itemCount = items.length;
        for (let i = 0; i < itemCount; i++) {items[i].draggable = true;}
        const originalClassName = list.className; // remember original class
        let entered = false; // keep track of enters and leaves
        
        // this handler is invoked when a drag first enters the list
        // it checks type of data drag contains, and if it can process it
        // contrary to expectations, it returns false to indicate that it actually is interested in a drop
        // this is a consequence of an event handler being applied as a element property rather than through addEventListener() method
        // it also targets drop target to let users know of that interest
        list.ondragenter = function(event) {

            const from = event.relatedTarget;
            // dragenter and dragleave events bubble, making it tricky to know when to highlight or unhighlight the element
            // in a case like this where there are multiple <li> children of <ul>
            entered = true;
            if ((from && !isChild(from, list)) || entered) {
                const dt = event.dataTransfer; // all DnD info is here
                // dt.types lists types / formats that the data being dragged is available in
                // type either has a contains() method or is an array with indexOf() method
                const types = dt.types; // available data formats
                // if there is no information on data type
                // highlight the list to let user know that it's listening for drop
                // return false to let browser know that drop is possible
                if (!types || // IE 
                    (types.contains && types.contains("text/plain")) || // HTML5
                    (types.indexOf && types.indexOf("text/plain") !== -1)) // Webkit 
                {
                    list.className = `${originalClassName} droppable`;
                    return false;
                }
                // if data type is unrecognized, cancel drop
                return;
            }
        };
        // this handler is invoked as mouse moves over the list
        // this handler must be defined or drop will be canceled
        list.ondragover = function(event) {return false;};
        // this handler is invoked as drag moves out of the list or out of one of its children
        // if drag is leaving the list, instead of just going from one list child to another, unhighlight list
        // otherwise, return false to confirm that drop is possible
        list.ondragleave = function(event) {

            const to = event.relatedTarget;
            if (to && !isChild(to, list)) {
                list.className = originalClassName;
                entered = false;
            }
            return false;
        };
        // this handler is invoked when drop actually happens
        // take the drop text and make it into a new <li> element
        list.ondrop = function(event) {
            // get the dropped data in plain text format
            const dt = event.dataTransfer;
            const text = dt.getData('text/plain');
            if (text) {
                // turn text into a new item at list end
                const item = document.createElement('li');
                item.draggable = true;
                item.appendChild(document.createTextNode(text));
                list.appendChild(item);
            }
            // unhighlight list and reset entered boolean value
            list.className = originalClassName;
            entered = false;
        };
        // this handler is initiated when a drag is initiated within a list
        list.ondragstart = function(event) {

            const target = event.target || event.srcElement;
             // if it bubbled up from something other than <li> ignore it
            if (target.tagName !== 'LI') return false;
            const dt = event.dataTransfer;
            // define data to drag and what format it is in
            dt.setData('Text', target.innerText || target.textContent); 
            // allow copies and moves of the data
            dt.effectAllowed = 'copyMove';
        };
        // this handler is invoked after a successful drop occurs
        list.ondragend = function(event) {

            const target = event.target || event.srcElement;
            if (event.dataTransfer.dropEffect = 'copyMove') target.parentNode.removeChild(target);
        };
        // utility function used in ondragenter and ondragleave
        function isChild(element, potentialParent) {
            
            for (let parent = element; parent; parent = parent.parentNode) {
                if (parent === potentialParent) return true;
            }
            return false;
        }
    }
});
// find all <input type="text"> elements with data-allowed-chars attribute
// register keypress and input event handlers to restrict user choice of chars to those defined by data-allowed-chars
// if <input> has data-message-id="" attribute, value of that attribute is taken to be value of the id="" of another element
// that other element is hidden and is made visible only if user tries to type in non-allowed character
// element is intended to offer an explanation as to why character in question is not allowed
whenReady(function() {
    // get all <input> elements
    const inputs = document.getElementsByTagName('input');
    const inputsCount = inputs.length;
    for (let i = 0; i < inputsCount; i++) {
        const input = inputs[i];
        if (input.type !== 'text' || !input.getAttribute('data-allowed-chars')) continue;
        // listening for input instead of keypress, because input event triggers copy paste, while keypress does not
        input.addEventListener('keypress', keypressFilter, false);
        input.addEventListener('paste', copyPasteFilter, false);
    }

    function keypressFilter(event) {

        const target = event.target || event.srcElement;
        // Get the character or text that was entered
        const text = event.key;
        // look up the information we need from this input element
        const allowed = target.getAttribute('data-allowed-chars');
        // get the message element, if its id is put into the input attribute
        const messageId = target.getAttribute('data-message-id');
        const messageElement = document.getElementById(messageId);
        if (allowed.indexOf(text) === -1) {
            // display the message element, if exists
            if (messageElement) messageElement.style.visibility = 'visible';
            event.preventDefault();
        }
        // if input is legal, make sure warning element stays hidden
        if (messageElement) messageElement.style.visibility = 'hidden';
    }

    function copyPasteFilter(event) {

        const target = event.target || event.srcElement;
        // Get the character or text that was entered
        const text = event.clipboardData.getData('text/plain');
        if (!text) event.preventDefault();
        // look up the information we need from this input element
        const allowed = target.getAttribute('data-allowed-chars');
        // get the message element, if its id is put into the input attribute
        const messageId = target.getAttribute('data-message-id');
        const messageElement = document.getElementById(messageId);
        const textLength = text.length;
        for (let i = 0; i < textLength; i++) {
            const character = text[i];
            if (allowed.indexOf(character) === -1) {
                // display the message element, if exists
                if (messageElement) messageElement.style.visibility = 'visible';
                event.preventDefault();
            }
        }
    }
});
