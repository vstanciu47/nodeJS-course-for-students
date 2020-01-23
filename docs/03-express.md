# [NodeJs API for a .NET developer](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer)



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

The project is already included in this repo, in folder `express-server-js`; use that for reference.
- create a folder for the first project `mkdir express-server-js & cd express-server-js`
- create the "heart" of the Node project `npm init -y` => this produces a `package.json` with default values; this is all you ever need;
you can add a VS project to contain this in the IDE, but it's not required.
- add the express module `npm i -s express` => you'll notice a new section created in `package.json` called `dependencies`;
when cloning a repo, the first thing you need to do is to restore these dependencies, by running `npm install`, or short `npm i`
- change `main` value in `package.json` to `src/index.js`; this is the entry point in the app, we'll keep it in the `src` folder
- `mkdir src & cd src`
  - add `index.js`, `env.js`, `app.js`, `log.js`
- `mkdir routes`
  - add `routes/discovery-client.route.js`, `routes/a-json.route.js`
- `mkdir services`
  - add `services/a-json.service.js`
- `mkdir data`
  - add `data/a-json.data.js`
- `mkdir models`
  - add `models/a-json.model.js`
- `cd ..`
- run `node .`; the `.` here means the current folder; since the folder contains a `package.json`, it will be used first for reading the project setup;
the entry point is the one specified in `main`; you could also run `node src/index.js`, it is esentially the same thing; and yet another way to run the app is with `npm run start` or `npm start`; `npm` reads the `scripts` section of the `package.json` and looks for the `start` script and executes it. After running the command, the console should display the message `development server listening on port 58080`;

- open browser to http://localhost:58080/ => 404 (no listener registered for route "/")
- go to http://localhost:58080/discovery/client => server settings that clients would need (this is the only URL they would need to hardcode)
- go to http://localhost:58080/api/json => the json response for this route

Now let's look at `src/app.js` to explain what happened. As I mentioned, there is no magic, so every response (including the 404) is written by us.

The file exports a function `makeApp` that does all the lifting for us. It registers different function callbacks for different routes. The order of the listeners is important, the app is matching a route until one is found, then it uses the callback registered for it.

That callback should terminate the request (e.g. with a `send`). Otherwise, the next middleware will be invoked.

If none of the routes is found, we have a middleware defined for preparing a 404 status. But this doesn't terminate the request, we're purposely calling the `next` middleware, which is the last one, the 500 (internal server error).

When the last route is hit, the generic response terminates the request, either with the given status code, or with a generic 500. Also, a very important thing is happening: if the environment is specifically set to `development`, we print out the error (this is just an example, in production there should be enough info logged at this stage to enable tracing any request), otherwise we leak no info to the consumer.

Now that you know how the requests are being handled, you understand how the routes you requested in the browser work, and more importantly WHY they work!

So the `src/app.js` is just a function, it doesn't really do anything, how does the server *really* work? Take a look again at the main entry, `src/index.js`. It imports the function, executes it, and uses the returned `app` object as callback for incoming requests.

We've used the browser to hit these routes, because we're hosting `GET` method routes, so it works.

For other methods (e.g. `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, etc), use a tool like [wget](https://www.gnu.org/software/wget/), [curl](https://curl.haxx.se/), or [postman](https://www.getpostman.com/).

Congratulations! You've just created a Node API and it looks like a manageable project now!




