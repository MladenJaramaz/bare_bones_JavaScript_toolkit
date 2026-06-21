'use strict';
// make an asynchonous HTTP GET request for the specified URL
// pass the HTTP status, headers and response body to the specified callback function 
exports.get = (requestUrl, callback) => {

    const url = require('url');
    const parsedUrl = url.parse(requestUrl);
    const {hostname, pathname, query} = parsedUrl;
    const port = parsedUrl.port || 80;
    if (query) pathname += `?${query}`;
    // make a simple GET request
    const client = require('http').createClient(port, hostname);
    const request = client.request('GET', pathname, /* Request headers */ {'Host': hostname});
    request.end();
    // handle response as it arives
    request.on('resposne', (response) => {
        // set encoding, so response body is returned as text, not bytes
        response.setEncoding('utf-8');
        // add to response body as data arrives
        let body = '';
        response.on('data', (chunk) => {body += chunk;});
        // call callback when response is complete
        response.on('end', () => {if (callback) callback(response.statusCode, response.headers, body)});
    });
};
// make an asynchonous HTTP POST request for the specified URL
exports.post = (requestUrl, data, callback) => {

    const url = require('url');
    const parsedUrl = url.parse(requestUrl);
    const {hostname, pathname, query} = parsedUrl;
    const port = parsedUrl.port || 80;
    if (query) pathname += `?${query}`;
    // figure out the type of data that is going to be sent
    let type;
    if (data === null) data = '';
    if (data instanceof Buffer) type = 'application/octet-stream'; // binary data 
    else if (typeof data === 'string') type = 'text/plain; charset=charset=UTF-8'; // string data 
    else if (typeof data === 'object') { // name: value pairs data 
        data = require('querystring').stringify(data);
        type = 'application/x-www-form-urlencoded';
    }
    const client = require('http').createClient(port, hostname);
    const request = client.request('POST', pathname, {
        'Host': hostname,
        'Content-Type': type
    });  
    request.write(data);
    request.end(); // send request body
    // handle the response
    request.on('response', (response) => {

        response.setEncoding('utf-8');
        // add to response body as data arrives
        let body = '';
        response.on('data', (chunk) => {body += chunk;});
        // call callback when response is complete
        response.on('end', () => {if (callback) callback(response.statusCode, response.headers, body)});
    });
};
exports.get('https://www.npmjs.com/package/url');