import * as express from "express";
import { env } from "./env";
import { setDiscoveryClientRouter } from "./routes/discovery-client.route";
import { setAJsonRoute } from "./routes/a-json.route";
import { IExpressError } from "./interfaces/IExpressError";

export { makeApp };

let app: express.Application;

function makeApp() {
	if (app) return app;

	app = express();

	// routes
	app.use(env.DISCOVERY_CLIENT_ROUTE, setDiscoveryClientRouter(express.Router()));
	app.use(env.A_JSON_ROUTE, setAJsonRoute(express.Router()));

	// 404
	app.use((_req: express.Request, _res: express.Response, next: express.NextFunction) => {
		const err = new Error("Not Found") as IExpressError;
		err.status = 404;
		next(err);
	});

	// 500
	app.use((err: IExpressError, _req: express.Request, res: express.Response) => {
		res.status(err.status || 500).send(env.NODE_ENV === "development" ? err : {});
	});

	return app;
}
