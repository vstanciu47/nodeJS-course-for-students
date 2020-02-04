import { Router, Request, Response, NextFunction } from "express";

export { getRouterMock, getResponseSpyMock, getNextFunctionSpyMock };

function getRouterMock() {
	const routes: { [method: string]: { [path: string]: Function } } = {};

	const addRoute = (method: string, path: string, callback: Function) => {
		routes[method] = routes[method] || {};
		routes["GET"][path] = callback;
	}

	const router = <Router><any>{
		get: (path: string, cb: (req: Request, res: Response, next: NextFunction) => any) => addRoute("GET", path, cb)
	};

	return { router, routes };
}

function getResponseSpyMock(): Response {
	const res = <Response><any>{};

	const status = (status: number): Response => { status = status; return res; };
	res.status = status;
	spyOn(res, <any>res.status.name).and.callThrough();

	const json = (json: Object): Response => { json = json; return res; };
	res.json = json;
	spyOn(res, <any>res.json.name).and.callThrough();

	return res;
}

function getNextFunctionSpyMock(): (error?: any) => any {
	const spyableObject = {
		next: (error?: any) => error = error
	};

	spyOn(spyableObject, <any>spyableObject.next.name);

	return spyableObject.next;
}
