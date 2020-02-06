import { Router } from "express";
import { noCallThru } from "proxyquire";
import { getRouterMock, getResponseSpyMock, getNextFunctionSpyMock } from "../../test/express-router-test.helper";

const proxyquire = noCallThru();

describe("discovery-client.route", () => {
	const envFile = { env: {} };

	const discoveryClientRoute: { setDiscoveryClientRoute(router: Router): Router } = proxyquire(
		"./discovery-client.route",
		{
			"../env": envFile
		}
	);

	const { router, routes } = getRouterMock();

	beforeAll(() => discoveryClientRoute.setDiscoveryClientRoute(router));

	describe("'GET /'", () => {
		it("route is set up", () => {
			expect(routes["GET"]["/"]).toBeDefined("route get / not setup");
			expect(typeof routes["GET"]["/"]).toBe("function", "route get / not a function");
		});

		it("callback success", () => {
			envFile.env = { A_JSON_ROUTE: "A_JSON_ROUTE" };
			const res = getResponseSpyMock();

			routes["GET"]["/"](undefined, res, undefined);

			expect(res.json).toHaveBeenCalledWith({ jsonRoute: "A_JSON_ROUTE" });
		});

		it("callback error", () => {
			envFile.env = <any>undefined;
			const next = getNextFunctionSpyMock();

			routes["GET"]["/"](undefined, undefined, next);

			expect(next).toHaveBeenCalledWith(TypeError("Cannot read property 'A_JSON_ROUTE' of undefined"));
		});
	});
});
