# [NodeJs API for a .NET developer](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer)



## 07. Testing



### Basics
We'll set up unit tests for our app. Let's add a test runner package: `npm i -D jasmine`.
I prefer [`jasmine`](https://jasmine.github.io/setup/nodejs.html), but many others are available (using different syntax, of course). This choice influences both the test file syntax and how they're run, so it's better to decide upfront what library to use and then stick to it, as changing it later will mean updating all test files and possibly eved the structure.

We'll add the definition files for jasmine (this should become a habbit, for every package, install the typings)
`npm i -D @types/jasmine`

We can run the package now with `node node_modules/jasmine/bin/jasmine`, and no surprise there, we see a `No specs found` message.
`jasmine` works with javascript, so we would have to write .js files for it to run, but we want to use typescript (and needless to say, we should't use js anymore).
We'll use `ts-node-dev` to do the compilation behind the scene for us, so add this to `scripts` section of `package.json`: `"test:unit": "ts-node-dev node_modules/jasmine/bin/jasmine --config=test/config.unit.jasmine"`.
While we're at it, let's finally change the `test` script: `"test": "npm run test:unit"`

`mkdir test` and add the config file in it `test/config.unit.jasmine.ts`
```typescript
const spec_dir = "./src";
const spec_files = ["**/*.test.ts"];
const stopSpecOnExpectationFailure = false;
const random = true;

export { spec_dir, spec_files, stopSpecOnExpectationFailure, random };
```
In config, we tell `jasmine` that our folder containing tests is the 'src' folder.
I personally add unit test files beside my modules, named the same but with '.test' suffix appended.

Add a first test file `src/demo.test.ts`
```typescript
describe("test suite", () => {
	it("test 1", () => expect(1).toBe(1, "this test should not fail"));
	it("test 2", () => expect(1).toBe(2, "this test failed miserably"));
});
```
The minimum required for a test is this simple: `describe` > `it` > `expect`.
`describe` can contain other `describe`, if you want to organise/nest tests.
More info can be found in the [docs](https://jasmine.github.io/tutorials/your_first_suite).

Run the test command: `npm run test:unit` and watch how it fail! After, you can remove this file, it was only a demo.



### Unit/integration tests
Files for this part can be found in folder `./support/07/`

Add a real unit test file `src/models/a-json.model.test.ts` and run test again.
This is the simplest example possible, testing a module that has no dependencies

Now add another unit test file `src/data/a-json.data.test.ts` and run test again.
This is not as simple anymore, as the module under test has its own dependencies, so these can no longer be tested as units, so they're becoming integration tests.
If we want to keep the dependency chain, we'll rename this file `a-json.data.it.test.ts`, so we know it is integration test.

To mock the dependencies of the modules under test, we'll use `npm i -D proxyquire @types/proxyquire`. Could use other modules for this, like `rewire`.
Now we can add the unit test `a-json.data.unit.test.ts`, where we mock dependencies.
Let's see how mocking works.
In `a-json.data.it.test.ts`, we import the actual implementation for `a-json.model` dependency.
```typescript
import { getAJson } from "./a-json.data";
```
This is a simple use case, `getAJson` could get the data from a db that doesn't exist on development environment.
In our case, `a-json.data` imports `a-json.model` which is what we want to mock.

We use `proxyquire` to import `a-json.data` and overwrite its imported module `../models/a-json.model`with a that we can manipulate:
```typescript
import * as proxyquire from "proxyquire";

describe("a-json-data", () => {
	// "./a-json.data" is the file that we're testing; it should be imported as reference, but we need to mock its dependencies
	// "../models/a-json.model" is a dependency of the file we're testing, and its export is aJsonModel function and AJsonModel class
	// instead of require("./a-json.data") or import ... from "./a-json.data", we use proxyquire("file", mocks)
	const aJsonModel: { getAJson(): { [key: string]: string } } = proxyquire(
		"./a-json.data",
		{
			"../models/a-json.model": {
				aJsonModel: () => ({ mockKey: "mock value" }),
				AJsonModel: class AJsonModelMock {
					mockKey: any;
					constructor() { this.mockKey = "mock value"; }
				}
			}
		}
	);
	...
});
```
With this we can even mock Node's native modules, the same way, e.g. for `fs.writeFile()` if we want to skip this in the test.

Let's spice up a little bit and add a new unit test, this time for a route `a-json.route.test.ts`.
This is where things get interesting. We want to test the callback functions for each path registered,
however these callbacks are not exported so they can't be mocked directly, we need to hack the route builder.
`a-json.route.ts` now looks like this:
```typescript
const aJsonRouter = express.Router();
module.exports.aJsonRouter = aJsonRouter;
...
```
When this file is imported, it is executed, so `aJsonRouter` is created the first time file is imported.
We sould avoid having executing code like this, instead we should use functions:
```typescript
export { setAJsonRoute };

function setAJsonRoute(router: Router): Router {
	...
	return router;
}
```
We now export a function that takes the route param, changes it and returns it.
We no longer need the `express` reference, we'll change the import to dereference only the interfaces:
```typescript
import { Router, Request, Response, NextFunction } from "express";
```
and change their usage so they don't point to the container object anymore (e.g. `express.Request` => `Request`).

We'll also have to change `app.ts` and pass in the router object
```typescript
import { setAJsonRoute } from "./routes/a-json.route";

function makeApp() {
	app.use(env.A_JSON_ROUTE, setAJsonRoute(express.Router()));
}
```
With these changes in place, we can write our test and inject a mock for the router
```typescript
// mock the router object and the methods it defines, so we can get reference to their callbacks
const router = <Router><any>{
	get: (path: string, cb: (req: Request, res: Response, next: NextFunction) => any) => routes[path] = cb
};
```

Now let's look at the new test we added: we're mocking the service dependency, and in `beforeAll` we're calling the `setAJsonRoute` function with the `router` mock object.
The `router` mock is used to obtain references to the callback functions for the paths defined in the route file.
The tests manipulate the service mock to test the success or failure of the route.

We'll do the same for `discovery-client.route.test.ts`, only this time we'll abstract out the router mock set up in `test/express-router-test.helper.ts`, because we will use it for all routes.
We'll also create helpers for creating `Response` object mocks and `NextFunction` function mocks.
We'll set up `jasmine` spies, which are just functions that track calls to other functions in a container, e.g. `{ trackMe: () => ... }`.
The tests can now be written with a lot less noise:
```typescript
const next = getNextFunctionSpyMock();
routes["GET"]["/"](undefined, undefined, next);
expect(next).toHaveBeenCalledWith(TypeError("Cannot read property 'A_JSON_ROUTE' of undefined"));
```

If we would want an integration test, we would create a test express app, register the router, and use the e2e test tehnique (see next section) on this route alone.
I would still mock the lowest layers that usually write stuff to persistence, so the machine remains in a clean state and tests can run in paralel and multiple times.



### End-to-end tests

Add [`supertest`](https://www.npmjs.com/package/supertest) package `npm i -D supertest @types/supertest`.

Add the new config file `test/config.e2e.jasmine.ts`
```typescript
const spec_dir = "./test";
const spec_files = ["**/*.e2e.test.ts"];
const stopSpecOnExpectationFailure = false;
const random = true;

export { spec_dir, spec_files, stopSpecOnExpectationFailure, random };
```

Add a new script in `package.json`: "test:e2e": `"ts-node-dev node_modules/jasmine/bin/jasmine --config=test/config.e2e.jasmine",`.
Update the `test` script as well: `"test": "npm run test:unit && npm run test:e2e"`.

Add a test file: `test/get-discovery-client.e2e.test.ts`.
In it, we import the app maker function and test a single route.
```typescript
import * as supertest from "supertest";
import { makeApp } from "../src/app";
import { env } from "../src/env";

describe(`GET ${env.DISCOVERY_CLIENT_ROUTE}`, () => it("success", done =>
	supertest(makeApp())
		.get(env.DISCOVERY_CLIENT_ROUTE)
		.expect(200, { jsonRoute: env.A_JSON_ROUTE }, done)
));
```


This tehnique can be used for integration tests as well, but instead of importing the whole app already made, we need to make one and mount a single route:
```typescript
// integration test example for a single route, with 'supertest'
// when routes are doing too much, be free to use `proxyquire` instead of import/require to mock the deps down the chain

import * as express from "express";
import * as supertest from "supertest";
import { env } from "../env"
import { setDiscoveryClientRouter } from "./discovery-client.route";

describe(`GET ${env.DISCOVERY_CLIENT_ROUTE}`, () => {
	let app: express.Application;

	beforeEach(() => app = express());

	it("success", done => {
		app.use(env.DISCOVERY_CLIENT_ROUTE, setDiscoveryClientRouter(express.Router()));

		supertest(app)
			.get(env.DISCOVERY_CLIENT_ROUTE)
			.expect(200, { jsonRoute: env.A_JSON_ROUTE }, done);
	});
});
```
You can now save this integration test as `src/routes/discovery-client.route.it.test` and run the whole batch `npm test`.

We now have two rounds of tests, that can be run together or separately, without complicated setup, extra projects, etc.



### Notes

I've considered unit and integration tests together, for simplicity, but they could be separated out to be able to run individually; modify/add a new jasmine config with a proper file name filter and create a run command.

I've also saved unit and integration tests beside their actual code files, to be easier to spot and to follow a convention from angular/frontend projects, but these can be easily moved out (just modify jasmine config).



[Next: mongodb](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer/browse/docs/08-mongodb.md)
