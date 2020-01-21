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
