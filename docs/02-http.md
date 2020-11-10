# [NodeJs API for a .NET developer](../README.md)

## 02. The `http` and `https` modules

Node comes with both these packages. They are used for making web requests and for hosting web servers.

The obvious difference between them from a code point of view is how a server is started:
`https` requires an options object with certificate contents to be able to start. For this short intro, we'll use `http`.

The simplest way to start a web server is this:

```javascript
// import the 'http' module
const http = require("http");

// create a server object with a given callback function
const server = http.createServer(onIncomingRequest);

// start listening for requests by attach it to a port
server.listen(80);

// function callback for incoming requests
// first param is the request object, created by Node for us
// second param is the response object that we need to manipulate
function onIncomingRequest(request, response) {
    // write a response to the client
    response.write("Freeze I'm ma Baker Put your hands in the air and give me all your money!");
    // end the response
    response.end();
}
```

In this case, the server would send the same response to all requests; URLs like [http://localhost](http://localhost) and [http://localhost/index.html](http://localhost/index.html) are treated the same, as well as hhtp methods like GET, POST, etc.

To make use of it, the requests must be filtered using the `request` object. Let's see a simple filter based on URL (ignoring the method GET, POST, etc):

```javascript
const fs = require("fs");

// function callback for incoming requests, with basic request filtering
function onIncomingRequest(request, response) {
    if (request.url === '/') {
        // prep the response string as before, only format it as valid html
        const htmlResponseString = "<html><body><p>Freeze I'm ma Baker Put your hands in the air and give me all your money!</p></body></html>";

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(htmlResponseString);
        response.end();

    } else if (request.url === "/inddex.html") {
        // read the index.html file from disk, the SYNC way (this blocks current thread until read is complete and must be avoided)
        // this is only a demo for a simple http server, so we can do it this way
        const indexHtmlFileContent = fs.readFileSync("/support/02/index.html", "UTF-8");

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(indexHtmlFileContent);
        response.end();

    } else if (request.url === "/42") {
        response.writeHead(302, { location: "https://en.wikipedia.org/wiki/42" }); // 301 ?
        response.write(indexHtmlFileContent);
        response.end();

    } else if (request.url === "/api/mabaker") {
        // this would be an API call, let's respond with a json
        // yes, this is a valid json, "what ever" is a valid key acoording to specs
        const jsonResponse = {
            freeze: "I'm ma Baker",
            "Put your hands in the air": "give me all your money"
        };

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify(jsonResponse));
        response.end();
    }
}
```

Now the reponse is adapted based on the URL of the incoming request. Any other route will not yield a response, there is no "magic" 404, we would need to add one.

And this highlights a very good "issue" for a ASP developer: there is no magic happening in the background (or the framework) that you have to know beforehand,
there are no files with special meaning (e.g. `global.asax`), methods (e.g. `void Main()`), configs (e.g. `app.dll.config`), or whatever else magic that need to be carefully setup so that the server can start and repond properly.

Everything is in plain sight, WYSIWYG style.

This can be tedious and overwhelming, so for this reason, in real life, we use already prepped modules to set these up for us.

[Next: express module](03-express.md)
