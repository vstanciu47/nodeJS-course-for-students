# [NodeJs API for a .NET developer](../README.md)



## 01. About [Node.Js](https://nodejs.org/dist/latest-v12.x/docs/api/)

What is Node? From official site: "Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine."

Unlike .NET, it is event based, single threaded, not thread based.

In practice, this means that all operations are put on the event loop and brought back into the main thread when ready.

This means that coding style is different, all framework ops have callbacks.

Now, single threaded doesn't actually mean everything runs in a single thread, it means that the MAIN thread is the only thread available to current running process.

All I/O ops run internally on separate threads and use callback functions to be brought back to the main thread.

Here's an example:
```javascript
// import the 'fs' (filesystem) module
const fs = require("fs");

// register a function to read file from disk (as UTF-8 text), with a callback when op is completed
// this starts the read as a side thread that calls the callback with the results
// callbacks are normally functions that accept 2 (or more) params:
fs.readFile("path/to/file", "UTF-8", fsReadFileCallback);

// first param of a callback is an error object, in case the op failed, the 2+ param are the result/success of the op
// in practice, the first thing to check in a callback is if error != undefined, if so op failed
function fsReadFileCallback(error, fileData) {
	if (error)
		console.error(error);
	else
		console.log(fileData);
}
```
Save this file as `example.js` and run it in a console/terminal: `node example`.

Node can do whatever .NET can do, more or less. You've already seen a short example of the `fs` module. BTW, in javascript packages are called modules.

In .NET we use `nuget` as the default package manager, in Node we use `npm`. It comes preinstalled with Node, but others are available (e.g. `yarn`).

Modules are separate files, either preinstalled or externally downloaded (more about this on a separate topic).

We can start separate threads/processes, there are multiple ways to do this (more about this on a separate topic).

For now, just consider that there is only one thread and you don't want to keep it busy; use callbacks when available.



[Next: http module](02-http.md)
