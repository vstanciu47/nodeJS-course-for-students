const express = require("express");
const { env } = require("./env");
const { discoveryClientRouter } = require("./routes/discovery-client.route");
const { aJsonRouter } = require("./routes/a-json.route");

module.exports.makeApp = makeApp;

let app;

function makeApp() {
	if (app) return app;

	app = express();

	// routes
	app.use(env.DISCOVERY_CLIENT_ROUTE, discoveryClientRouter);
	app.use(env.A_JSON_ROUTE, aJsonRouter);

	// 404
	app.use((_req, _res, next) => {
		const err = new Error("Not Found");
		err.status = 404;
		next(err);
	});

	// 500
	app.use((err, _req, res) => {
		res.status(err.status || 500).send(env.NODE_ENV === "development" ? err : {});
	});

	return app;
}
