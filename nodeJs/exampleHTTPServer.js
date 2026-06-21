'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');



const port = 3000;
const server = new http.Server(); // create a new HTTP server
server.listen(port); // run it on port 3000
server.on('connection', () => {console.log(`Listening on ${port}.`);});
server.on('request', (request, response) => {

    const parsedUrl = url.parse(request.url); // parse requested url
    const parsedPathname = parsedUrl.pathname;
    const fileName = parsedPathname.substring(1); // strip leading /
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
    if (parsedPathname=== '/test/delay') { 
        // simulate a slow network connection
        const delay = parseInt(parsedUrl.query) || 2000; // simulate a 2 seconds delay
        response.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'}); // set response status and headers
        response.write(`Sleeping for ${delay} milliseconds ...`); // start writing a response
        setTimeout(() => {
            // finish writing a response after delay
            response.write('Done.');
            response.end();
        }, delay); 
    } else if (parsedPathname=== '/test/mirror') {
        // usual response
        response.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
        response.write(`${request.method} ${request.url} HTTP/${request.httpVersion}\r\n`); // start writing a response
        // add every chunk of request body to the response
        response.write('\r\n');
        request.on('data', (dataChunk) => {response.write(dataChunk);});
        // end response when the request ends
        request.on('end', () => {response.end();});
    } else {
        // serve requested file from local directory
        let type;
        switch (fileExtension) {
            // guess content type based on file extension
            case 'html': 
                type = 'text/html; charset=UTF-8';
                break;
            case 'htm':
                type = 'text/html; charset=UTF-8';
                break;
            case 'js':
                type = 'application/javascript; charset=UTF-8';
                break;
            case 'css': 
                type = 'text/css; charset=UTF-8';
                break;
            case 'txt': 
                type = 'text/plain; charset=UTF-8';
                break;
            case 'manifest': 
                type = 'text/cache-manifest; charset=UTF-8';
                break;
            default: 
                type = 'application/octet-stream';
               break;
        }
        // read the file asynchronously, pass content as a single chunk to callback
        // use streaming APi fs.createReadStream() for large files
        fs.readFile(fileName, (error, content) => {

            if (error) {
                response.writeHead(404, {'Content-Type': 'text/plain; charset=UTF-8'});
                response.write(error.message);
                response.end();
            } else {
                response.writeHead(200, {'Content-Type': type});
                response.write(content);
                response.end();
            }
        });
    }
});