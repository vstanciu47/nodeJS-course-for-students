import { Router } from "express";
import { noCallThru } from "proxyquire";

const proxyquire = noCallThru();

describe("a-json.route", () => {
	// import the file under test and mock its dependencies

	// prepare the exports object of the mocked dependency
	// this is empty now because it will be asigned different values per test
	const aJsonService: { getAJson(): { [key: string]: string } } = <any>{};

	const aJsonRoute: { setAJsonRoute(router: Router): Router } = proxyquire(
		"./a-json.route",
		{
			"../services/a-json.service": aJsonService
		}
	);

	// define object to keep all registered routes and get reference to their callbacks
	const routes: { [path: string]: Function } = {};

	// mock the router object and the methods it defines, so we can get reference to their callbacks
	const router = <Router><any>{};

	// build router; the routes will now contain all paths and their callbacks
	// all we have to do now is call the callbacks with the desired params to test behaviour
	beforeAll(() => aJsonRoute.setAJsonRoute(router));

	it("setAJsonRoute - router setup", () => {
		expect(routes["/"]).toBeDefined("route get / not setup");
		expect(typeof routes["/"]).toBe("function", "route get / not a function");
	});

	it("setAJsonRoute - get / - success", () => {
		aJsonService.getAJson = () => ({ mockKey: "mock value" });

		let result: { [key: string]: string } = <any>undefined;
		const res = { json: (val: any) => result = val };

		routes["/"](null, res, null);

		expect(result).toBeDefined("route get / not ended with json()");
		expect(result.mockKey).toBe("mock value", "route get / not ended with correct json() object");
	});

	it("setAJsonRoute - get / - error", () => {
		aJsonService.getAJson = () => { throw new Error("test"); };

		let result: Error = <any>undefined;
		const next = (val: any) => result = val;

		routes["/"](null, null, next);

		expect(result).toBeDefined("route get / not ended with next()");
		expect(result.message).toBe("test", "route get / not ended with correct next() error");
	});
});
