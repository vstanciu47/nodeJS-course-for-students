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

	describe("getAJson", () => {
		// for simplicity out data from getAJson() does not implement an interface, so we'll keep it simple and declare it any
		let theData: { [key: string]: string } | undefined;

		// runs before each 'it' in this 'describe' block; there is also a beforeAll hook available
		beforeEach(() => theData = aJsonModel.getAJson());

		// runs after each 'it' in this 'describe' block; there is also a afterAll hook available
		afterEach(() => theData = undefined);

		it("should get some data", () => expect(theData).toBeDefined("theData was not set"));
		it("should contain mockKey", () => expect((<any>theData).mockKey).toBeDefined("theData does not contain mockKey"));
		it("mockKey should be 'mock value'", () => expect((<any>theData).mockKey).toBe("mock value", "theData does not contain mockKey"));
		it("should not contain key 'nonExistingModelProp'",
			() => expect((<any>theData).nonExistingModelProp).not.toBeDefined("theData contains key nonExistingModelProp"));
	});
});
