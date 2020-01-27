import { Router, Request, Response, NextFunction } from "express";
import { env } from "../env";

export { setDiscoveryClientRouter };

function setDiscoveryClientRouter(router: Router): Router {
	router.get("/", getdiscoveryClient);
	return router;
}

function getdiscoveryClient(_req: Request, res: Response, next: NextFunction) {
	try {
		const clientSettings = {
			jsonRoute: env.A_JSON_ROUTE
		};
		return res.status(200).json(clientSettings);
	} catch (ex) {
		return next(ex);
	}
}
