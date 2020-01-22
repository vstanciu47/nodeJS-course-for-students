const http = require("http");
const fs = require("fs");

http.createServer(onIncomingRequest).listen(80);

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
