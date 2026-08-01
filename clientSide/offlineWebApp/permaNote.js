'use strict';
// Some variables we need throughout
let editor, applicationCacheStatusLine, saveButton, idleTimer;
// The first time the application loads
window.onload = function() {
    // Initialize local storage if this is the first time
    if (localStorage.note == null) localStorage.note = '';
    if (localStorage.lastModified == null) localStorage.lastModified = 0;
    if (localStorage.lastSaved == null) localStorage.lastSaved = 0;
    // Find the elements that are the editor UI. Initialize global variables.
    editor = document.getElementById('editor');
    applicationCacheStatusLine = document.getElementById('applicationCacheStatusLine');
    saveButton = document.getElementById('saveButton');
    editor.value = localStorage.note; // Initialize editor with saved note
    editor.disabled = true; // But don't allow editing until we sync
    // Whenever there is input in the textarea
    editor.addEventListener('input', function (e) {
        // Save the new value in localStorage
        localStorage.note = editor.value;
        localStorage.lastModified = Date.now();
        // Reset the idle timer
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(save, 5000);
        // Enable the save button
        saveButton.disabled = false;
    }, false);
    // Each time the application loads, try to sync up with the server
    sync();
};
// Save to the server before navigating away from the page
window.onbeforeunload = function() {if (localStorage.lastModified > localStorage.lastSaved) save();};
// If we go offline, let the user know
window.onoffline = function() {applicationCacheStatus('Offline');};
// When we come online again, sync up.
window.ononline = function() {sync();};
// Notify the user if there is a new version of this application available.
// We could also force a reload here with location.reload()
window.applicationCache.onupdateready = function() {applicationCacheStatus('A new version of this application is available. Reload to run it');};
// Also let the user know if there is not a new version available.
window.applicationCache.onnoupdate = function() {applicationCacheStatus('You are running the latest version of the application.');};
// A function to display a applicationCacheStatus message in the applicationCacheStatus line
function applicationCacheStatus(msg) {applicationCacheStatusLine.innerHTML = msg;}
// Upload the note text to the server (if we're online).
// Will be automatically called after 5 seconds of inactivity whenever the note has been modified.
function save() {

    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = null;
    if (navigator.onLine) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', '/note');
        xhr.send(editor.value);
        xhr.onload = function() {

            localStorage.lastSaved = Date.now();
            saveButton.disabled = true;
        };
    }
}
// Check for a new version of the note on the server. If a newer version is not found, save the current version to the server.
function sync() {
    
    if (navigator.onLine) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/note');
        xhr.send();
        xhr.onload = function() {

            let remoteModTime = 0;
            let useIt;
            let now;
            if (xhr.applicationCacheStatus == 200) {
                remoteModTime = xhr.getResponseHeader('Last-Modified');
                remoteModTime = new Date(remoteModTime).getTime();
            }
            if (remoteModTime > localStorage.lastModified) {
                applicationCacheStatus('Newer note found on server.');
                useIt = confirm('There is a newer version of the note\n' +
                                    'on the server. Click Ok to use that version\n'+
                                    'or click Cancel to continue editing this\n'+
                                    'version and overwrite the server');
                now = Date.now();
                if (useIt) {
                    editor.value = localStorage.note = xhr.responseText;
                    localStorage.lastSaved = now;
                    applicationCacheStatus('Newest version downloaded.');
                } 
                else applicationCacheStatus("Ignoring newer version of the note.");
                localStorage.lastModified = now;
            } 
            else applicationCacheStatus("You are editing the current version of the note.");
            if (localStorage.lastModified > localStorage.lastSaved) save();
            editor.disabled = false; // Re-enable the editor
            editor.focus(); // And put cursor in it
        };
    }
    else { // If we are currently offline, we can't sync
        applicationCacheStatus("Can't sync while offline");
        editor.disabled = false;
        editor.focus();
    }
}