/**
 * Node.js Runtime Features — Streams, Buffers & the File System
 *
 * GOAL
 * Move the SAME file two different ways and feel the difference:
 * 1) Load the whole file into memory with fs.readFile, and log its size.
 * 2) Flow the file through a stream and pipe it to a writable stream (a copy).
 * Then explain, in your own words, why the stream approach is preferable for
 * large files.
 */

const fs = require('fs');
const path = require('path');

// Absolute, OS-safe path to the sample file
const INPUT = path.join(__dirname, 'sample-data.txt');
const OUTPUT = path.join(__dirname, 'sample-copy.txt');

// PART 1: Read the whole file into memory, then log its size
function readWholeFile() {
  fs.readFile(INPUT, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`readFile: loaded ${data.length} bytes into memory`);
  });
}

// PART 2: Stream the file and pipe it to a writable stream
function streamFile() {
  const readable = fs.createReadStream(INPUT);
  const writable = fs.createWriteStream(OUTPUT);

  readable.pipe(writable);

  writable.on('finish', () => {
    console.log('stream: finished copying via 64KB chunks (flat memory)');
  });
}

// PART 3: Explanation
// fs.readFile() holds the whole file in memory at once, so memory usage grows
// with the file size. A stream moves the file in smaller chunks instead of
// loading everything at once, which keeps peak memory usage lower and relatively
// stable even as the file becomes very large.

// Run both approaches
readWholeFile();
streamFile();

module.exports = {
  readWholeFile,
  streamFile,
  INPUT,
  OUTPUT
};