'use strict';
const url = 'http://localhost:3000/ajaxTest';

function postMessage(message) {

    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
    request.send(message);
}
function getText(url, callback) {
    
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.onreadystatechange = function() {

        if (this.readyState === 4 && this.status === 200) {
            const type = this.getResponseHeader('Content-Type');
            if (type && type.indexOf('text/plain') !== -1) callback(this.responseText);          
        }
    }   
    request.send();
}
function encodeFormDataIntoQueryString(formData) {

    if (!formData) return '';
    const pairs = [];
    for (let formField of formData) pairs.push(encodeURIComponent(formField[0].replace('%20', '+')) + '=' + encodeURIComponent(formField[1].replace('%20', '+')));
    return pairs.join('&');
}
// make POST request with form data
function postFormData(url, data, callback) {

    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.onreadystatechange = function() {

        if (this.readyState === 4 && this.status === 200) {
            const type = this.getResponseHeader('Content-Type');
            if (type && type.indexOf('text/plain') !== -1) callback(this.responseText);          
        }
    }
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    request.send(data);
}
// make GET request with query string
function getWithQueryString(url, data, callback) {
    
    const request = new XMLHttpRequest();
    const queryString = encodeFormDataIntoQueryString(data);
    request.open('GET', url + '?' + queryString);
    request.onreadystatechange = function() {

        if (this.readyState === 4 && this.status === 200 && callback && typeof callback === 'function') {
            callback(this.responseText);
        }
    }
    request.send();
}
// make POST request with JSON data
function postJSON(url, jsonData, callback) {

    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.onreadystatechange = function() {

        if (this.readyState === 4 && this.status === 200 && callback && typeof callback === 'function') {
            callback(this.responseText);        
        }
    }
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    request.send(JSON.stringify(jsonData));
}
/* make POST request with XML data in following format:
<query>
    <find zipcode="12345" radius="2km">
        pizza
    </find>
</query>
*/
function postXML(url, what, where, radius, callback) {

    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.onreadystatechange = function() {
        
        if (this.readyState === 4 && this.status === 200 && callback && typeof callback === 'function') callback(request);
    }
    // construct XML document with root element <query>
    const xmlDoc = document.implementation.createDocument('', 'query', null);
    const queryElem = xmlDoc.documentElement;
    const findElem = xmlDoc.createElement('find');
    findElem.setAttribute('zipcode', where);
    findElem.setAttribute('radius', radius);
    const textNode = xmlDoc.createTextNode(what);
    findElem.appendChild(textNode);
    queryElem.appendChild(findElem);
    request.send(xmlDoc);
}
// find all input type="file" elements and register onchange event listeners so that when user selects a file
// it is uploaded via AJAX to the server whose URL is specified in data-upload-to attribute of the input element
whenReady(function() {

    const fileInputs = document.querySelectorAll('input[type="file"][data-upload-to]');
    for (let fileInput of fileInputs) {
        fileInput.addEventListener('change', function(event) {

            const uploadUrl = fileInput.getAttribute('data-upload-to');
            const file = fileInput.files[0]; // assume single file upload
            const formData = new FormData();
            formData.append('file', file);
            const request = new XMLHttpRequest();
            request.open('POST', uploadUrl);
            request.send(formData);
        }, false);
    }
});
function postMultipartFormData(url, formData, callback) {

    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.onreadystatechange = function() {

        if (this.readyState === 4 && this.status === 200 && callback && typeof callback === 'function') callback(this.responseText);        
    }
    const formDataObj = new FormData();
    for (let name in formData) {
        if (!formData.hasOwnProperty(name)) continue;
        const value = formData[name];
        if (typeof value === 'function') continue;
        formDataObj.append(name, value);
    }
    // send() will automatically set the correct Content-Type header including boundary
    request.send(formDataObj);
}
function downloadProgress(event) {return event.lengthComputable ? `${(event.loaded / event.total) * 100}%` : 'Data size unknown';}
// find all elements of the 'file-drop-target' class and register drag & drop event handlers
// when files are dropped upload them via AJAX to the server whose URL is specified in data-upload-to attribute
whenReady(function() {

    const dropTargets = document.querySelectorAll('.file-drop-target[data-upload-to]');
    for (let dropTarget of dropTargets) {
        const url = dropTarget.getAttribute('data-upload-to');
        if (!url) continue;
        fileUploadHandler(dropTarget, url);
    }
    console.log(dropTargets);
    function fileUploadHandler(dropTarget, url) {
        // to keep things simple, we only handle single file upload, so keep a track if a file is being uploaded
        let uploading = false;  
        console.log(dropTarget, url);
        dropTarget.ondragenter = function(event) {
            console.log('dragenter');
            const types = event.dataTransfer.types;
            if (types && ((types.indexOf && types.indexOf('Files') !== -1) || (types.contains && types.contains('Files')))) {
                dropTarget.classList.add('file-drop-target-active');
                return false;
            }
        }; 
        dropTarget.ondragover = function(event) {
            console.log('dragover');
            if (!uploading) return false;
        }
        dropTarget.ondragleave = function(event) {
            console.log('dragleave');
            if (!uploading)dropTarget.classList.remove('file-drop-target-active');
        }
        dropTarget.ondrop = function(event) {
            console.log('drop');
            event.preventDefault();
            if (uploading) return false;
            const files = event.dataTransfer.files;
            if (files && files.length) {
                uploading = true;

                let userNoticeElement = 'Uploading files:<ul>';
                const requestBody = new FormData();
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    requestBody.append('file' + i, file);
                    userNoticeElement += `<li>${file.name}</li>`;
                }
                userNoticeElement += '</ul>';
                
                dropTarget.innerHTML = userNoticeElement;
                dropTarget.classList.remove('file-drop-target-active');
                dropTarget.classList.add('file-drop-target-uploading');
            
                const request = new XMLHttpRequest();
                request.open('POST', url);
                request.upload.onprogress = function(event) {
                  
                    dropTarget.innerHTML = userNoticeElement + `<p>Upload progress: ${downloadProgress(event)}</p>`;
                };
                request.upload.onload = function() {
                    uploading = false;
                    dropTarget.classList.remove('file-drop-target-uploading');
                    dropTarget.innerHTML = 'Drop files here to upload';
                };
                console.log(requestBody);
                request.send(requestBody);
                return false;
            }
            dropTarget.classList.remove('file-drop-target-active');         
        }
    }
});
// Issue an AJAX GET request for the contents of a URL
// if response arrives successfully, pass response text to callback function
// if the response does not arrive in 'timeout' milliseconds, abort the request
// browser must support XMLHttpRequest Level 2
// browser may fire 'readystatechange' event after abort() 
// so we use a flag 'completed' to ignore late events with partial, timed-out responses
// this problem does not arise if load event is used
function getTextWithTimeout(url, timeout, callback) {

    const request = new XMLHttpRequest();
    let timedOut = false;
    // set up timeout timer
    const timer = setTimeout(function() {

        timedOut = true;
        request.abort();
    }, timeout);
    request.onreadystatechange = function() {

        if (this.readyState !== 4 || this.status !== 200) return; // ignore incomplete/unsuccessful responses
        if (timedOut) return; // ignore late responses after timeout
            // request completed, clear the timeout timer
            clearTimeout(timer);
            callback(this.responseText);
    };
    request.open('GET', url);
    request.send();
}
// find all <a> elements with an href attribute but no title attribute and adds onmouseover event listeners
// event handler makes an AJAX HEAD request to the URL in the href attribute
// and sets the title attribute to the value of the Content-Type, Content-Length and Last-Modified headers
whenReady(function() {
    // check if there is a chance for cross-origin requests to succeed
    const corsSupported = 'withCredentials' in new XMLHttpRequest();
    // find all <a> elements with an href attribute but no title attribute
    const anchorElements = document.querySelectorAll('a[href]:not([title])');
    for (let anchorElement of anchorElements) {
        // check if the link is cross-origin
        if (anchorElement.host !== location.host || anchorElement.protocol !== location.protocol) {
            anchorElement.title = 'Off-site link'; // assume we cannot get header info from cross-origin links
            // unless CORS is supported, skip adding event listener
            if (!corsSupported) continue;
            anchorElement.addEventListener('mouseover', mouseOverHandler, false);
        }
    }

    function mouseOverHandler(event) {

        const anchorElement = event.currentTarget;
        const url = anchorElement.href;
        const request = new XMLHttpRequest();
        request.open('HEAD', url); // ask for headers only

        request.onreadystatechange = function() {
            console.log(this.readyState, this.status);
            if (this.readyState !== 4) return; // ignore incomplete responses
            if (this.status === 200) {
                const contentType = request.getResponseHeader('Content-Type');
                const contentLength = request.getResponseHeader('Content-Length');
                const lastModified = request.getResponseHeader('Last-Modified');
                console.log(contentType, contentLength, lastModified);
            } else {

            }
        };
        request.send(); 
    }
});