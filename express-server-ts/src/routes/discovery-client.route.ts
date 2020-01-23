import * as express from "express";
import { env } from "../env";

export const discoveryClientRouter = express.Router();

discoveryClientRouter.get("/", getdiscoveryClient);

function getdiscoveryClient(_req: express.Request, res: express.Response, next: express.NextFunction) {
	try {
		const clientSettings = {
			jsonRoute: env.A_JSON_ROUTE
		};
		return res.json(clientSettings);
	} catch (ex) {
		return next(ex);
	}
}
