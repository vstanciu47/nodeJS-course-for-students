import * as supertest from "supertest";
import { makeApp } from "../src/app";
import { env } from "../src/env";

describe(`GET ${env.DISCOVERY_CLIENT_ROUTE}`, () => it("success", done =>
	supertest(makeApp())
		.get(env.DISCOVERY_CLIENT_ROUTE)
		.expect(200, { jsonRoute: env.A_JSON_ROUTE }, done)
));
