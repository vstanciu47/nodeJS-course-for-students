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
