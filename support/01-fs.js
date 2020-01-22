// import the 'fs' (filesystem) module
const fs = require("fs");

// register a function to read file from disk (as UTF-8 text), with a callback when op is completed
// this starts the read as a side thread that calls the callback with the results
// callbacks are normally functions that accept 2 (or more) params:
fs.readFile("path/to/file", "UTF-8", fsReadFileCallback);

// first param of a callback is an error object, in case the op failed, the 2+ param are the result/success of the op
// in practice, the first thins to check in a callback is if error != undefined, if so op failed
function fsReadFileCallback(error, fileData) {
	if (error)
		console.error(error);
	else
		console.log(contents);
}
