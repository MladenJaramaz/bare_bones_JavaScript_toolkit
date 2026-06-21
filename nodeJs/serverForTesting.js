'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');


const port = 3000;
const server = new http.Server(); // create a new HTTP server
server.listen(port); // run it on port 3000


server.on('request', (request, response) => {

    const parsedUrl = url.parse(request.url); // parse requested url
    const parsedPathname = parsedUrl.pathname;
    const fileName = parsedPathname.substring(1); // strip leading /
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);;
    if (parsedPathname === '/') {
        console.log('Serving homepage');
        response.writeHead(200, {
            'Content-Type': 'text/plain; charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
        });
        response.write('Homepage');
        response.end();
    } else if (parsedPathname === '/ajaxTest') {
        console.log(request.headersDistinct['content-type']);
        console.log('+++ Raw Headers +++');
        console.log(request.rawHeaders);
        console.log('+++ Distinct Headers +++');
        console.log(request.headersDistinct);
        console.log('+++ All Headers +++');
        console.log(request.headers);
        // simulate an AJAX response
        if (request.method === 'POST') {
            if (request.headersDistinct['content-type'][0].indexOf('application/x-www-form-urlencoded') !== -1) {
                // split string on Content-Disposition: form-data;
                // use querystring module to parse URL-encoded form data
                    let body = '';
                    request.on('data', (chunk) => {body += chunk.toString();});// Convert buffer to string     
                    request.on('end', () => {
                       
                        const requestArr = body.split('Content-Disposition');
                        const filteredRequestArr = requestArr.filter(item => item.indexOf('form-data;') !== -1);
                        console.log(filteredRequestArr);
                        let responseText;
                        response.writeHead(200, {
                            'Content-Type': 'text/plain; charset=UTF-8',
                            'Access-Control-Allow-Origin': '*'
                        });
                        response.write(`Server received your POST data: ${responseText}`);
                        response.end();
                    });
            } else if (request.headersDistinct['content-type'][0].indexOf('multipart/form-data') !== -1) {
                console.log('Received multipart/form-data POST request.');
                response.writeHead(200, {
                    'Content-Type': 'text/plain; charset=UTF-8',
                    'Access-Control-Allow-Origin': '*'
                });
                response.write('Server received your multipart/form-data POST request.');
                response.end();
                // parse multipart form data
                // implement formidable or multer for this, don't do it manually, requires deep understanding of MIME
                // formidable or multer can be used without express.js
            } else if (request.headersDistinct['content-type'][0].indexOf('text/plain') !== -1) {
                    // plain text data
                    let body = '';
                    request.on('data', chunk => {
                        
                        console.log(chunk.toString());
                        body += chunk.toString();
                    });
                    request.on('end', () => {
                        
                        console.log('Received POST data:', body);
                        response.writeHead(200, {
                            'Content-Type': 'text/plain; charset=UTF-8',
                            'Access-Control-Allow-Origin': '*'
                        });
                        response.write('Server received your POST data: ' + body);
                        response.end();
                    });
                } else if (request.headersDistinct['content-type'][0].indexOf('application/json') !== -1) {
                    // parse JSON data
                    let body = '';
                    response.end('Server received your POST data: ' + body);
                }  else if (request.headers['content-type'][0].indexOf('text/xml') !== -1) {
                    let body = '';
                    request.on('data', chunk => {
                        
                        console.log(chunk.toString());
                        body += chunk.toString();
                    });
                    request.on('end', () => {
                        
                        console.log('Received POST data:', body);
                        response.writeHead(200, {
                            'Content-Type': 'text/plain; charset=UTF-8',
                            'Access-Control-Allow-Origin': '*'
                        });
                        response.write('Server received your POST data: ' + body);
                        response.end();
                    });
                } else if (request.method === 'HEAD') {
                    response.writeHead(200, {
                        'Content-Type': 'text/plain; charset=UTF-8',
                        'Access-Control-Allow-Origin': '*'
                    });
                    response.end();
                } else {
                    response.writeHead(200, {
                        'Content-Type': 'text/plain; charset=UTF-8',
                        'Access-Control-Allow-Origin': '*'
                    });
                    response.write('This is the AJAX response to GET /ajaxTest. Success!');
                    response.end('End of AJAX response.');
                }
            }
    } else if (parsedPathname === '/errorTest') {
        // simulate a server error
        throw new Error('Simulated server error.');
        response.write('This is an error test.');
        response.end();
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
                response.writeHead(404, {
                    'Content-Type': 'text/plain; charset=UTF-8',
                    'Access-Control-Allow-Origin': '*'
                });
                response.write(error.message);
                response.end();
            } else {
                response.writeHead(200, {
                    'Content-Type': type,
                    'Access-Control-Allow-Origin': '*'
                });
                response.write(content);
                response.end();
            }
        });
    }
});



// Inventories for SRP principle demonstration purposes
const responseMethodInventory = {
    'GET': function() {},
    'POST': function() {}
};

const responseContentTypeInventory = {
    'text/plain': function() {},
    'application/json': function() {},
    'application/x-www-form-urlencoded': function() {},
    'multipart/form-data': function() {}
};