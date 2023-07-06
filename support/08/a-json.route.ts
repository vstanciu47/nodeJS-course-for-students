import { Router, Request, Response, NextFunction } from 'express';
import { AJson } from '../models/a-json.model';
import * as jsonService from '../services/a-json.service';

export { setAJsonRouter };

function setAJsonRouter(router: Router): Router {
	router.get('/', getAJson);
	router.post('/', postAJson);

	return router;
}

async function getAJson(req: Request, res: Response, next: NextFunction) {
	const query: any = req.query.key1;

	let aJson: Error | AJson | null;
	try {
		aJson = await jsonService.getAJson(query);
	} catch (ex) {
		return next(ex);
	}

	if (aJson instanceof Error) {
		return next(aJson);
	}

	if (aJson === null) {
		return res.status(404).end();
	}

	console.log('getAJson(), aJson:', aJson);
	return res.json(aJson);
}

async function postAJson(req: Request, res: Response, next: NextFunction) {
	const body: any = req.body;

	let aJson: Error | AJson;
	try {
		aJson = await jsonService.saveAJson(body);
	} catch (ex) {
		return next(ex);
	}

	if (aJson instanceof Error) {
		return next(aJson);
	}

	console.log('postAJson(), aJson:', aJson);
	return res.status(201).json(aJson);
}
