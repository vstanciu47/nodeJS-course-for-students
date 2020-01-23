import * as express from "express";
import { env } from "./env";
import { discoveryClientRouter } from "./routes/discovery-client.route";
import { aJsonRouter } from "./routes/a-json.route";

export { makeApp };

let app: express.Application;

function makeApp() {
	if (app) return app;

	app = express();

	// routes
	app.use(env.DISCOVERY_CLIENT_ROUTE, discoveryClientRouter);
	app.use(env.A_JSON_ROUTE, aJsonRouter);

	// 404
	app.use((_req, _res, next) => {
		const err = new Error("Not Found");
		(<any>err).status = 404;
		next(err);
	});

	// 500
	app.use((err: Error, _req: express.Request, res: express.Response) => {
		res.status((<any>err).status || 500).send(env.NODE_ENV === "development" ? err : {});
	});

	return app;
}
