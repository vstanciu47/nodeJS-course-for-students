# [NodeJs API for a .NET developer](../README.md)



## 07. Testing



### Basics
We'll set up unit tests for our app. Let's add a test runner package: `npm i -D jasmine`.
I prefer [`jasmine`](https://jasmine.github.io/setup/nodejs.html), but many others are available (using different syntax, of course).
This choice influences both the test file syntax and how they're run, so it's better to decide upfront what library to use and then stick to it, as changing it later will mean updating all test files and possibly eved the structure.

We'll add the definition files for jasmine (this should become a habbit, for every package, install the typings)
`npm i -D @types/jasmine`

We can run the package now with `node node_modules/jasmine/bin/jasmine`, and no surprise there, we see a `No specs found` message.
`jasmine` works with javascript, so we would have to write .js files for it to run, but we want to use typescript (and needless to say, we should't use js anymore).
We'll use `ts-node-dev` to do the compilation behind the scene for us, so add this to `scripts` section of package.json: `"test:unit": "ts-node-dev node_modules/jasmine/bin/jasmine --config=test/config.unit.jasmine",`.
While we're at it, let's finally change the `test` script: `"test": "npm run test:unit",`

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

To mock the dependencies of the modules under test, we'll use `npm i -D proxyquire @types/proxyquire`.
Duplicate the previous test `a-json.data.it.test.ts` as `a-json.data.test.ts` and mock the dependencies:  
Replace the dependency `import * as aJsonData from "./a-json.data";` with the mocker package `import * as proxyquire from "proxyquire";`  
Use the mocker package to import the dependency and "fake" its data:
```typescript
describe("a-json-data", () => {
	// "./a-json.data" is the file that we're testing; it should be imported as reference, but we need to mock its dependencies
	// "../models/a-json.model" is a dependency of the file we're testing, and its export is aJsonModel function and AJsonModel class
	// instead of require("./a-json.data") or import ... from "./a-json.data", we use proxyquire("file", mocks)
	const aJsonData: { getAJson(): { [key: string]: string } } = proxyquire(
		"./a-json.data",
		{
			"../models/a-json.model": {
				aJsonModel: () => ({ key1: "value 1" }),
				AJsonModel: class AJsonModelMock {
					key1: any;
					constructor() { this.key1 = "value 1"; }
				}
			}
		}
	);
	...
}
```
We are still importing `a-json.data`, but not using the actual `require` or `import` syntax, but through `proxyquire`.  
If we look in `a-json.data`, we see that it imports another module `a-json.model`.  
This is a simple usage, but you can imagine that this may be a call to the database and we don't want to do that in a unit test.  
Instead, we tell `proxyquire` to "fake" this dependency and use the mock object instead, that we can manipulate in the test.  

With this we can even mock Node's native modules, the same way, e.g. for `fs.writeFile()` if we want to skip this in the test.



Let's spice up a little bit and add a new unit test, this time for a route `a-json.route.test.ts`.
This is where things get interesting. We want to test the callback functions for each path registered,
however these callbacks are not exported so they can't be mocked directly, we need to hack the route builder.
`a-json.route.ts` now looks like this:
```typescript
...
const aJsonRouter = express.Router();
export { aJsonRouter };
...
```
When this file is imported, it is executed, so `aJsonRouter` is created the first time file is imported. We should avoid having executing code like that because it cannot be tested and it can have unpredictable consequences.  
Let's update `a-json.route.ts` to make it testable:
```typescript
import { Router, Request, Response, NextFunction } from "express";
import * as aJsonService from "../services/a-json.service";

export function setAJsonRoute(router: Router): Router {
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
```
We now export a function that requires the route object passed in as param, changes it and returns it.  
We'll also have to change `app.ts` to import the new function, create the router object and pass it
```typescript
import { setAJsonRoute } from "./routes/a-json.route";

function makeApp() {
	app.use(env.A_JSON_ROUTE, setAJsonRoute(express.Router()));
}
```
With these changes in place, our app should work just as before, go ahead and try it `npm start`.  
Now let's try the tests again `npm run test:unit`...it fails! Why?  See if you can make any sense of the error:  
`TypeError: routes./ is not a function` `at UserContext.<anonymous> (D:\Development\_ts\src\routes\a-json.route.test.ts:53:14)`  
The tests try to access properties of `routes` which don't exist; `routes` is set on line 21 as an empty object literal!  
It should get populated with the data. For this, we need to mock the router:
```typescript
	// mock the router object and the methods it defines, so we can get reference to their callbacks
	const router = <Router><any>{
		get: (path: string, cb: (req: Request, res: Response, next: NextFunction) => any) => routes[path] = cb
	};
```
So in `a-json.route`, the `setAJsonRoute` function takes a router object and adds listners for routes; that's what we need to mock.  
We use this mock to populate the routes object! Now we know the routes and the callback functions and we can test their logic.
We use `beforeAll` in the test to call `setAJsonRoute` once per suite.
The tests manipulate the service mock `aJsonService.getAJson` to test the success or failure of the route.

Let's set up a test abstraction for mocking: `test/express-router-test.helper.ts`.  
It provides an easy way to test all route files without repeating code.

Go ahead and update `discovery-client.route.ts` and `app.ts` to use injectable router object, just like we did for `a-json.route.ts`.  
For `discovery-client.route.test.ts`, we will use the mock providers from the helper and use `jasmine` spies.  
Spies are just functions that track calls to other functions in a container, e.g. `{ trackMe: () => ... }`.  
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

Add a new script in package.json: `"test:e2e": "ts-node-dev node_modules/jasmine/bin/jasmine --config=test/config.e2e.jasmine",`.
Update the `test` script as well: `"test": "npm run test:unit && npm run test:e2e"`.

Create an e2e test: `test/get-discovery-client.e2e.test.ts`.
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
Run `npm run test:e2e` or the full suite `npm test`.  

Using this tehnique we can do integration tests as well.  
Create `src/routes/discovery-client.route.it.test.ts`. Instead of importing the whole app already made, we make one and mount a single route:
```typescript
// integration test example for a single route, with 'supertest'
// when routes are doing too much, be free to use `proxyquire` instead of import/require to mock the deps down the chain

import * as express from "express";
import * as supertest from "supertest";
import { env } from "../env"
import { setDiscoveryClientRoute } from "./discovery-client.route";

describe(`GET ${env.DISCOVERY_CLIENT_ROUTE}`, () => {
	let app: express.Application;

	beforeEach(() => app = express());

	it("success", done => {
		app.use(env.DISCOVERY_CLIENT_ROUTE, setDiscoveryClientRoute(express.Router()));

		supertest(app)
			.get(env.DISCOVERY_CLIENT_ROUTE)
			.expect(200, { jsonRoute: env.A_JSON_ROUTE }, done);
	});
});
```
You can now save this integration test and run the whole batch `npm test`.

We now have two rounds of tests, that can be run together or separately, without complicated setup, extra projects, etc.



### Notes

I've considered unit and integration tests together, for simplicity, but they could be separated out to be able to run individually; modify/add a new jasmine config with a proper file name filter and create a run command.

I've also saved unit and integration tests beside their actual code files, to be easier to spot and to follow a convention from angular/frontend projects, but these can be easily moved out (just modify jasmine config).



[Next: mongodb](08-mongodb.md)
