# [NodeJs API for a .NET developer](../README.md)



## 03. Express

The most used module for setting up a Node web server is [express](https://expressjs.com/), a "Fast, unopinionated, minimalist web framework for node"

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
This is doing the same as in the previous example.

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

The files for this project are included in folder `./support/03/`; use them for reference.
1. create a folder for the first project `mkdir express-server-js & cd express-server-js`
2. create the "heart" of the Node project `npm init -y` => this produces a `package.json` with default values; this is all you ever need;
you can add a VS project to contain this in the IDE, but it's not required.
3.  add the express module `npm i -s express` => you'll notice a new section created in `package.json` called `dependencies`;
when cloning a repo, the first thing you need to do is to restore these dependencies, by running `npm install`, or short `npm i`
4. change `main` value in `package.json` to `src/index.js`; this is the entry point in the app, we'll keep it in the `src` folder
5. create folder structure
   a. `mkdir src` => `src/index.js`, `src/env.js`, `src/app.js`, `src/log.js`
   b. `mkdir routes` => `src/routes/discovery-client.route.js`, `src/routes/a-json.route.js`
   c. `mkdir services` => `src/services/a-json.service.js`
   d. `mkdir data` => `src/data/a-json.data.js`
   e. `mkdir models` => `src/models/a-json.model.js`
   f. `cd ..`
6. run `node .`; the `.` here means the current folder; since the folder contains a `package.json`, it will be used first for reading the project setup;
the entry point is the one specified in `main`; you could also run `node src/index.js`, it is esentially the same thing;
and yet another way to run the app is with `npm run start` or `npm start`;
`npm` reads the `scripts` section of the `package.json` and looks for the `start` script and executes it.
After running the command, the console should display the message `development server listening on port 80`;

7. open browser 
   a. go to http://localhost/ => 404 (no listener registered for route "/")
   b. go to http://localhost/discovery/client => server settings that clients would need (this is the only URL they would need to hardcode)
   c. go to http://localhost/api/json => the json response for this route

Now let's look at `src/app.js` to explain what happened. As I mentioned, there is no magic, so every response (including the 404) is written by us.

The file exports a function `makeApp` that does all the lifting for us. It registers different function callbacks for different routes.
The order of the listeners is important, the app is matching a route until one is found, then it uses the callback registered for it.

That callback should terminate the request (e.g. with a `send`). Otherwise, the next middleware will be invoked.

If none of the routes is found, we have a middleware defined for preparing a 404 status. But this doesn't terminate the request,
we're purposely calling the `next` middleware, which is the last one, the 500 (internal server error).

When the last route is hit, the generic response terminates the request, either with the given status code, or with a generic 500.
Also, a very important thing is happening: if the environment is specifically set to `development`, we print out the error
(this is just an example, in production there should be enough info logged at this stage to enable tracing any request),
otherwise we leak no info to the consumer.

Now that you know how the requests are being handled, you understand how the routes you requested in the browser work, and more importantly WHY they work!

So the `src/app.js` is just a function, it doesn't really do anything, how does the server *really* work?
Take a look again at the main entry, `src/index.js`.
It imports the function, executes it, and uses the returned `app` object as callback for incoming requests.

We've used the browser to hit these routes, because we're hosting `GET` method routes, so it works.

For other methods (e.g. `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, etc), use a tool like [wget](https://www.gnu.org/software/wget/), [curl](https://curl.haxx.se/), or [postman](https://www.getpostman.com/).

Congratulations! You've just created a Node API and it looks like a manageable project now!



[Next: typescript](04-typescript.md)
