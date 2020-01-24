import { getAJson } from "./a-json.data";

describe("a-json-data", () => {
	describe("getAJson", () => {
		// for simplicity out data from getAJson() does not implement an interface, so we'll keep it simple and declare it any
		let theData: any;

		// runs before each 'it' in this 'describe' block; there is also a beforeAll hook available
		beforeEach(() => theData = getAJson());

		// runs after each 'it' in this 'describe' block; there is also a afterAll hook available
		afterEach(() => theData = undefined);

		it("should get some data", () => expect(theData).toBeDefined("theData was not set"));
		it("should contain key1", () => expect(theData.key1).toBeDefined("theData does not contain key1"));
		it("key1 should be 'value 1'", () => expect(theData.key1).toBe("value 1", "theData does not contain key1"));
		it("should not contain key 'nonExistingModelProp'",
			() => expect(theData.nonExistingModelProp).not.toBeDefined("theData contains key nonExistingModelProp"));
	});
});
