import * as express from "express";
import * as aJsonService from "../services/a-json.service";

export const aJsonRouter = express.Router();

aJsonRouter.get("/", getAJson);

function getAJson(_req: express.Request, res: express.Response, next: express.NextFunction) {
	try {
		const jsonData = aJsonService.getAJson();
		return res.json(jsonData);
	} catch (ex) {
		return next(ex);
	}
}
