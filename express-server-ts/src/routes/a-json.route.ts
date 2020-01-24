import { Router, Request, Response, NextFunction } from "express";
import * as aJsonService from "../services/a-json.service";

export { setAJsonRoute };

function setAJsonRoute(router: Router): Router {
	router.get("/", getAJson);

	return router;
}

function getAJson(_req: Request, res: Response, next: NextFunction) {
	try {
		const jsonData = aJsonService.getAJson();
		return res.json(jsonData);
	} catch (ex) {
		return next(ex);
	}
}
