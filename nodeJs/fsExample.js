'use strict';

const fs = require('fs');

function fileCopyDone() {console.log('copying files done')}
function fileCopy(filename1, filename2, doneCallback) {

    const input = fs.createReadStream(filename1);
    const output = fs.createWriteStream(filename2);
    input.on('data', (inputData) => {output.write(inputData);});
    input.on('error', (inputError) => {throw inputError;});
    input.on('end', () => {

        output.end();
        if (doneCallback) doneCallback();
    });
}
