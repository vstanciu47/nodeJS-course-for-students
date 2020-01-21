# NodeJs API for a .NET developer

## Prep env
- install [Node.Js](https://nodejs.org/en/) (use LTS)

## About [Node.Js](https://nodejs.org/dist/latest-v12.x/docs/api/)
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
// in practice, the first thins to check in a callback is if error != undefined, if so op failed
function fsReadFileCallback(error, fileData) {
	if (error)
		console.error(error);
	else
		console.log(contents);
}
```

Node can do whatever .NET can do, more or less. You've already seen a short example of the `fs` module. BTW, in javascript packages are called modules.
In .NET we use `nuget` as the default package manager, in Node we use `npm`. It comes preinstalled with Node, but others are available (e.g. `yarn`).
Modules are separate files, either preinstalled or externally downloaded (more about this on a separate topic).

We can start separate threads/processes, there are multiple ways to do this (more about this on a separate topic).
For now, just consider that there is only one thread and you don't want to keep it busy; use callbacks when available.

## The `http` and `https` modules
Node comes with both these packages. They are used for making requests and for hosting web servers
The obvious difference between them from a code point of view is how a server is started:
`https` requires an options object with certificate contents to be able to start. For this short intro, we'll use `http`.

The simplest way to start a web server is this:
```javascript
// import the 'http' module
const http = require("http");

// create a server object with a given callback function
// start listening for requests by attach it to a port
http.createServer(onIncomingRequest)
	.listen(80);

// function callback for incoming requests
// first param is the request object, created by Node for us
// second param is the response object that we need to manipulate
function onIncomingRequest(requset, response) {
	// write a response to the client
	response.write("Freeze I'm ma Baker Put your hands in the air and give me all your money!");
	// end the response
	response.end();
}
```
This is impractical in real life, as it would respond the same for all requests; `http://localhost` and `http://localhost/index.html` would yield the same response.
To make use of it, the requests must be filtered using the `request` object. Let's see a simple filter based on URL:
```javascript
// function callback for incoming requests, with basic request filtering
function onIncomingRequest(requset, response) {
	if (requset.url === '/') {
		// prep the response string as before, only format it as valid html
		const htmlResponseString = "<html><body><p>Freeze I'm ma Baker Put your hands in the air and give me all your money!</p></body></html>";

		response.writeHead(200, { 'Content-Type': 'text/html' });
		response.write(htmlResponseString);
		response.end();

	} else if (requset.url === "/inddex.html") {
		// read the index.html file from disk, the SYNC way (this blocks current thread until read is complete and must be avoided)
		// this is only a demo for a simple http server, so we can do it this way
		const indexHtmlFileContent = fs.readFileSync("/path/to/index.html", "UTF-8");

		response.writeHead(200, { 'Content-Type': 'text/html' });
		response.write(indexHtmlFileContent);
		response.end();

	} else if (requset.url === "/api/mabaker") {
		// this would be an API call, let's respond with a json
		// yes, this is a valid json, "what ever" is a valid key acoording to specs
		const jsonResponse = {
			freeze: "I'm ma Baker",
			"Put your hands in the air": "give me all your money"
		};

		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.write(jsonResponse);
		response.end();
	}
}
```
What we've done here is to change the reponse based on URL of the request. Any other route will not yield a response, there is no "magic" 404, we would need to add one.
And this highlights a very good "issue" for a ASP developer: there is no magic happening in the background, in the framework that you have to know beforehand,
there are no files with special meaning (e.g. `global.asax`), methods (e.g. `void Main()`), configs (e.g. `app.dll.config`), or whatever else magic that need to be carefully setup so that the server can start and repond properly.
Everything is in plain sight, WYSIWYG.
This can be tedious and overwhelming, so for this reason, in real life, we use already prepped modules to set these up for us.

The most used module is [express](https://www.npmjs.com/package/express), a "Fast, unopinionated, minimalist web framework for node"
```javascript
// import the express module
const express = require("express");

// create the express app
const app = express();

// register filter for incoming requests, and a callback function when a match is made
app.get("/", function (req, res) {
  res.send("Hello World");
});

// start listening
app.listen(80);
```
This is doing the same as in the example above. It uses the `http` module and performs the same function as above.
With (modules like) this, our API can finally be easily implemented, concentrating on "middleware" style, not on tedious formatting of proper responses.
One more thing to mention here is that the express app object is basically an incoming response callback.
It uses `http` itself for starting it up, but it can be attached to `https` server, when secure connections are needed.
```javascript
const https = require("https");
const express = require("express");
const fs = require("fs");

// get cert files
const privateKey = fs.readFileSync("path/to/server.key", "UTF-8");
const certificate = fs.readFileSync("path/to/server.crt", "UTF-8");

// create the express app
const app = express();
// setup app middleware here

// host the app callback in a https server
https.createServer({ key: privateKey, cert: certificate }, app)
	.listen(443);
```

## Express quick setup
- `mkdir express-server-js & cd express-server-js`
- `npm init -y`
- `npm i -s express`
- change `"main": "src/index.js"` in `package.json`
- `mkdir src & cd src`
- add `index.js`, `env.js`, `app.js`, `log.js`
- `mkdir routes`
- add `routes/discovery-client.route.js`, `routes/a-json.route.js`
- `mkdir services`
- add `services/a-json.service.js`
- `cd ..`
- run `node .`
- open browser to http://localhost:58080/ => 404 (no listner registered for route "/")
- go to http://localhost:58080/discovery/client => server settings that clients would need (this is the only URL they would need to hardcode)
- go to http://localhost:58080/api/json => the json response for this route

Congratulations! You've just created a Node API and it looks like a manageable project now!
