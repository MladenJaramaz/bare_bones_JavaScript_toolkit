#! C:\Program Files\nodejs\node.exe
'use strict';

const fs = require('fs');
const path = require('path');

const processArguments = process.argv;
const dir = processArguments.length > 2 ? processArguments[2] : process.cwd(); // get current working directory
const filenames = fs.readdirSync(dir); // read directory content synchronously
process.stdout.write('Name\tSize\tDate\n');
filenames.forEach((filename) => {

    const fullName = path.join(dir, filename);
    const stats = fs.statSync(fullName); // get file attributes
    if (stats.isDirectory()) filename = `/${filename}`; // mark subdirectories 
    process.stdout.write(`${filename}\t${stats.size}\t${stats.mtime}\n`); // output file name, file size and modification time
});