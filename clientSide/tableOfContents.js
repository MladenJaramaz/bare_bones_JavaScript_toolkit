'use strict';
// This modules registers anonymous functions to be invoked when the page is loaded
// when it runs, it looks for the existence of the element with id='toc'
// if there is no such element, the module does creates one at the start of the document body
// Next, function finds all <h1> through <h6> elements in the document and creates a list of them in the toc element
// function treats them as section titles, adds section numbers to them and creates a link to the section
// the generated anchors have names that begin with 'toc'
// All entries have a class 'toc-entry'
// entries also have a class 'toc-level-N' where N is the level of the header (1-6)
// section numbers inserted into the headings have a class 'toc-section-num'
document.addEventListener('DOMContentLoaded',tocGenerator, false);

function tocGenerator() {

    const tocElem = document.getElementById('toc') || document.createElement('div');
    if (!tocElem.id) {
        tocElem.id = 'toc';
        document.body.insertBefore(tocElem, document.body.firstChild);
    }
    tocElem.innerHTML = ''; // clear existing content
    // Find all header elements from h1 to h6
    let headers;
    if (document.querySelectorAll) headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6'); // Modern browsers
    else headers =  findHeaders(document.body, []);// Fallback for older browsers
    function findHeaders(root, headersContainer) {
        // Recursively traverse the DOM to find all header elements         
        for (let c = root.firstChild; c !== null; c = c.nextSibling) {
            if (c.nodeType !== 1) continue; // Skip non-element nodes
            if (c.tagName.match(/^H[1-6]$/i)) {
                headersContainer.push(c);
            } else {
                headersContainer.push(...findHeaders(c, headersContainer));
            }
        }
        return headersContainer;
    }
    // initialize an array to keep track of section numbers
    const sectionNumbers = [0, 0, 0, 0, 0, 0];
    // Loop through the headers that have been found
    const headersCount = headers.length;
    for (let i = 0; i < headersCount; i++) {
        const header = headers[i];
        // skip header if it is already inside tocElem
        if (header.parentNode === tocElem) continue;
        // Determine the level of the header (1-6)
        const level = parseInt(header.tagName.charAt(1));
        if (isNaN(level) || level < 1 || level > 6) continue; // Skip if not a valid header level
        // Increment the section number for this level  
        sectionNumbers[level - 1]++;
        // reset lower level headers numbers to zero
        for (let j = level; j < 6; j++) sectionNumbers[j] = 0;
        // Create a section number string like "3.1.2"
        const sectionNumber = sectionNumbers.slice(0, level).join('.');
        // add section number to <span> element that will be inserted into the header
        const sectionNumSpan = document.createElement('span');
        sectionNumSpan.className = 'toc-section-num';
        sectionNumSpan.innerHTML = sectionNumber;
        header.insertBefore(sectionNumSpan, header.firstChild);
        // wrap the header in a named anchor so that it can be linked to
        const anchor = document.createElement('a');
        anchor.name = `toc-${sectionNumber.replaceAll('.', '-')}`; // Replace dots with dashes for valid anchor name
        header.parentNode.insertBefore(anchor, header);
        anchor.appendChild(header); // Move the header inside the anchor
        // Create a new link to this section
        const link = document.createElement('a');
        link.href = `#toc-${sectionNumber.replaceAll('.', '-')}`;
        link.innerHTML = header.innerHTML; // Copy the header content
        // place the link inside a new <div> element that is styled as a toc entry
        const tocEntry = document.createElement('div');
        tocEntry.className = `toc-entry toc-level-${level}`;
        tocEntry.appendChild(link);
        tocElem.appendChild(tocEntry);
    }
} 