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
