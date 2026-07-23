'use strict';

const net = require('net');
const server = net.createServer();
const port = 2000;

server.listen(port, () => {console.log(`Listening on port${port}`);});
server.on('connection', (stream) => {

    stream.on('data', (data) => {stream.write(data);});
    stream.on('end', (data) => {console.log('Connection closed');});
});