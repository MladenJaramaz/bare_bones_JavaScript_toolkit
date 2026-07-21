'use strict';
// schedule invocation(s) of function in the future
// if end is omitted, never stop invoking function
// if end & interval are omitted, invoke function just once, after start argument
// if end & interval & start are omitted, invoke function immediately and never again
// start, interval & end are specified in ms
function invoker(func, start, interval, end) {

    let timeoutRef;
    if (!start) start = 0; // default to 0ms
    if (arguments.length <= 2) timeoutRef = setTimeout(func, start); // single invocation after start ms
    else timeoutRef = setTimeout(repeater, start); // start with repetitions after start ms
    function repeater() {
        // invoked by setTimeout() above
        const intervalRef = setInterval(func, interval); // invoke function every interval ms
        // if end is defined stop invoking after end ms
        if (end) setTimeout(() => {

            clearInterval(intervalRef);
            clearTimeout(timeoutRef);
        }, end);
    }
}
// parse ampersand-separated name=value argument pairs from URL query string
function parseUrlArgs() {

    const args = {};
    const query = location.search.substring(1); // remove '?' from string
    const pairs = query.split('&'); // split at ampersands
    const pairsCount = pairs.length;
    for (let i = 0; i < pairsCount; i++) {
        const pair = pairs[i];
        const position = pair.indexOf('='); // locate name-value position
        if (position === -1) continue;
        const name = pair.substring(0, position);
        let value = pair.substring(position + 1);
        value = decodeURIComponent(value); // decode the value
        args[name] = value;
    }
    return args;
}
// Asynchronously load and execute a script from a specified URL
function loadasync(url) {

    const head = document.getElementsByTagName("head")[0]; // Find document <head>
    const s = document.createElement("script"); // Create a <script> element
    s.src = url; // Set its src attribute
    head.appendChild(s); // Insert the <script> into head
}
// function accepting optional number of string arguments and treats them like element id's
// if any argument turns out to be non-valid id an error is thrown
function getElements(/* ids */) {

    const elements = {};
    const argumentsCount = arguments.length;
    for (let i = 0; i < argumentsCount; i++) {
        const id = arguments[i];
        const element = document.getElementById(id);
        if (!element) throw new Error(`No element with id: ${id}.`);
        elements[id] = element;
    }
    return elements;
}
// return a nth ancestor of an element, or null if not found
// if n is 0, or omitted, return the element itself
function getNthAncestor(element, n) {

    if (isNaN(n)) throw new Error('Ancestor index can be only numbers.');
    if (n <= 0) return element; // return the element itself
    while(n-- > 0 && element) element = element.parentNode;
    if (!element || element.nodeType !== 1) return null;
    return element;
}
// return a nth child of an element, or null if it does not exist
// if n is 0, or omitted, return the element itself
// if n is positive, 1 means first child, 2 means second child, etc.
// if n is negative, -1 means last child, -2 means second to last child, etc. 
/**
* Return the nth element child of e, or null if it doesn't have one.
* Negative values of n count from the end. 0 means the first child, but
* -1 means the last child, -2 means the second to last, and so on.
*/
function getNthChild(element, n) {
    
    const elementChildren = element.children;
    const elementChildrenCount = elementChildren.length;
    if (element.children) { // If children array exists
        if (n === 0) return null; // If n is 0, no child
        if (n < 0){
            n += elementChildrenCount; // Convert negative n to array index 
            if (n < 0) return null; // If still negative, no child
            if (n >= elementChildrenCount) return null; // If n is too large, no child
            else return elementChildren[n]; // Return specified child
        }
        return elementChildren[n - 1]; // Return specified child
    }
}  

// return a nth sibling of an element
// if n is 0, or omitted, return the element itself
// if n is positive, return the nth sibling after the element
// if n is negative, return the nth sibling before the element
function getNthSibling(element, n) {

    if (isNaN(n)) throw new Error('Sibling index can be only numbers.');
    if (n === 0) return element; // return the element itself
    if (n > 0) while(n-- > 0 && element) element = element.nextElementSibling;
    else if (n < 0) while(n++ < 0 && element) element = element.previousElementSibling;
    if (!element || element.nodeType !== 1) return null;
    return element;
}

// Insert the child node into parent so that it becomes child node n
function insertChild(parent, child, n) {

    if (n < 0 || n > parent.childNodes.length) throw new Error("invalid index");
    else if (n == parent.childNodes.length) parent.appendChild(child);
    else parent.insertBefore(child, parent.childNodes[n]);
}
// reverse the order of the childNodes of an element
function reverseChildNodes(element) {

    const tempContainer = document.createDocumentFragment(); // create a temporary container
    const childNodes = element.childNodes; // get the child nodes
    const childNodesCount = childNodes.length;
    for (let i = childNodesCount - 1; i >= 0; i--) {
        const childNode = childNodes[i];
        tempContainer.appendChild(childNode); // append the child node to the temporary container
    }
    element.appendChild(tempContainer); // append the temporary container to the element
}
// reverse the order of the children of an element
function reverseChildren(element) {

    const tempContainer = document.createDocumentFragment(); // create a temporary container
    const children = element.children; // get children
    const childrenCount = children.length;
    for (let i = childrenCount - 1; i >= 0; i--) {
        const child = children[i];
        tempContainer.appendChild(child); // append the child to the temporary container
    }
    element.appendChild(tempContainer); // append the temporary container to the element
}
// sort the rows of a table's first tbody element according to the value of the nth cell
// use comparator function if one is specified, otherwise compare values alphabetically
function sortTableRows(table, n, comparator) {

    const tbody = table.tBodies[0]; // get the first tbody element
    const rows = Array.from(tbody.rows); // convert HTMLCollection to array
    rows.sort((row1, row2) => {
        
        const cell1 = row1.cells[n -1];
        const cell2 = row2.cells[n -1];
        let value1 = cell1.textContent || cell1.innerText;
        let value2 = cell2.textContent || cell2.innerText;
        if (comparator) return rows.sort(comparator);
        else {
            if (value1 < value2) return -1;
            if (value1 > value2) return 1;
            return 0;
        }
    });      
     // append the sorted rows to the tbody element, and automatically remove them from their old position
    const rowsCount = rows.length;
    for (let i = 0; i < rowsCount; i++) tbody.appendChild(rows[i]);     
}
// make th elements in a table header clickable, if any are found 
// clicking on them sorts table by their column
function makeTableHeaderClickable(table) {

    const thead = table.tHead; // get the first thead element
    if (!thead) return; // no header
    const thElements = thead.getElementsByTagName('th'); // get all th elements
    const thElementsCount = thElements.length;
    for (let i = 0; i < thElementsCount; i++) {
        const thElement = thElements[i];
        thElement.addEventListener('click', () => {sortTableRows(table, i + 1);});
    }
}

