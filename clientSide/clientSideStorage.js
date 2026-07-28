'use strict';
// Store the name/value pair as a cookie, encoding the value with
// encodeURIComponent() in order to escape semicolons, commas, and spaces.
// If daysToLive is a number, set the max-age attribute so that the cookie
// expires after the specified number of days. Pass 0 to delete a cookie.
function setCookie(name, value, daysToLive) {

    let cookie = `${name}=${encodeURIComponent(value)}`;
    if (typeof daysToLive === 'number')
    cookie += `; max-age=${daysToLive * 60 * 60 * 24}`;
    document.cookie = cookie;
}
// Return the document's cookies as an object of name/value pairs.
// Assume that cookie values are encoded with encodeURIComponent().
function getCookies() {

    const cookies = {}; // The object we will return
    const all = document.cookie; // Get all cookies in one big string
    if (all === '') // If the property is the empty string
    return cookies; // return an empty object
    const list = all.split('; '); // Split into individual name=value pairs
    for (let i = 0; i < list.length; i++) { // For each cookie
        const cookie = list[i];
        const position = cookie.indexOf('='); // Find the first = sign
        const name = cookie.substring(0, position); // Get cookie name
        let value = cookie.substring(position + 1); // Get cookie value
        value = decodeURIComponent(value); // Decode the value
        cookies[name] = value; // Store name and value in object
    }
    return cookies;
}
// This class implements the Storage API that localStorage and sessionStorage
// do, but implements it on top of HTTP Cookies.
function CookieStorage(maxAge, path) { // Arguments specify lifetime and scope

    // Get an object that holds all cookies
    let cookies = (function() { // The getCookies() function shown earlier

        const cookies = {}; // The object we will return
        const all = document.cookie; // Get all cookies in one big string
        if (all === '') return cookies; // If the property is the empty string return an empty object
        const list = all.split('; '); // Split into individual name=value pairs
        for (let i = 0; i < list.length; i++) { // For each cookie
            const cookie = list[i];
            const position = cookie.indexOf('='); // Find the first = sign
            const name = cookie.substring(0, position); // Get cookie name
            let value = cookie.substring(position + 1); // Get cookie value
            value = decodeURIComponent(value); // Decode the value
            cookies[name] = value; // Store name and value
        }
        return cookies;
    }());
    // Collect the cookie names in an array
    let keys = [];
    for (let key in cookies) keys.push(key);
    // Now define the public properties and methods of the Storage API
    // The number of stored cookies
    this.length = keys.length;
    // Return the name of the nth cookie, or null if n is out of range
    this.key = function(n) {

        if (n < 0 || n >= keys.length) return null;
        return keys[n];
    };
    // Return the value of the named cookie, or null.
    this.getItem = function(name) {return cookies[name] || null;};
    // Store a value
    this.setItem = function(key, value) {

        if (!(key in cookies)) { // If no existing cookie with this name
            keys.push(key); // Add key to the array of keys
            this.length++; // And increment the length
        }   
        // Store this name/value pair in the set of cookies.
        cookies[key] = value;
        // Now actually set the cookie.
        // First encode value and create a name=encoded-value string
        let cookie = `${key}=${encodeURIComponent(value)}`;
        // Add cookie attributes to that string
        if (maxAge) cookie += `; max-age=${maxAge}`;
        if (path) cookie += `; path=${path}`;
        // Set the cookie through the magic document.cookie property
        document.cookie = cookie;
    };
    // Remove the specified cookie
    this.removeItem = function(key) {

        if (!(key in cookies)) return; // If it doesn't exist, do nothing
        // Delete the cookie from our internal set of cookies
        delete cookies[key];
        // And remove the key from the array of names, too.
        // This would be easier with the ES5 array indexOf() method.
        for (let i = 0; i < keys.length; i++) { // Loop through all keys
            if (keys[i] === key) { // When we find the one we want
                keys.splice(i,1); // Remove it from the array.
                break;
            }
        }
        this.length--; // Decrement cookie length
        // Finally actually delete the cookie by giving it an empty value
        // and an immediate expiration date.
        document.cookie = `${key}=; max-age=0`;
    };
    // Remove all cookies
    this.clear = function() {

        // Loop through the keys, removing the cookies
        for (let i = 0; i < keys.length; i++) document.cookie = `${keys[i]}=; max-age=0`;
        // Reset our internal state
        cookies = {};
        keys = [];
        this.length = 0;
    };
}



function applicationCacheStatus(msg) {

    document.getElementById('applicationCacheStatusline').innerHTML = msg;
    console.log(msg); 
}
// If the application is not already cached, or if the manifest has changed,
// the browser downloads and caches everything listed in the manifest.
// The downloading event signals the start of this download process.
window.applicationCache.ondownloading = function() {

    applicationCacheStatus('Downloading new version');
    window.progressCount = 0; // Used in the progress handler below
    return false;
};
// progress events are fired periodically during the downloading process,
// typically once for each file downloaded.
window.applicationCache.onprogress = function(e) {
    // The event object should be a progress event (like those used by XHR2)
    // that allows us to compute a completion percentage, but if not,
    // we keep count of how many times we've been called.
    let progress = '';
    if (e && e.lengthComputable) progress = ' ' + `${Math.round(100 * e.loaded / e.total)}%`; // Progress event: compute percentage
    else progress = ` (${++ window.progressCount})`; // Otherwise report # of times called
    applicationCacheStatus('Downloading new version' + progress);
    return false;
};
