const express = require("express");
const { env } = require("../env");

const discoveryClientRouter = express.Router();

module.exports.discoveryClientRouter = discoveryClientRouter;

discoveryClientRouter.get("/", getdiscoveryClient);

function getdiscoveryClient(_req, res, next) {
	try {
		const clientSettings = {
			jsonRoute: env.A_JSON_ROUTE
		};
		return res.json(clientSettings);
	} catch (ex) {
		return next(ex);
	}
}
