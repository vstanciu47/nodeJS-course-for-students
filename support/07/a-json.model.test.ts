import { aJsonModel, AJsonModel } from "./a-json.model";

describe("a-json-model", () => {
	describe("aJsonModel", () => {
		it("init with undefined", () => {
			const model = aJsonModel();
			expect(model).toBeDefined();
			expect(model.key1).toBe("value 1");
		});
		it("init with key1", () => {
			const value1 = "abc";
			const model = aJsonModel({ key1: value1 });
			expect(model).toBeDefined();
			expect(model.key1).toBe(value1);
		});
		it("init with non existing key", () => {
			const nonExistingKeyName = "nonExistingKey";
			const inputModel = <any>{};
			inputModel[nonExistingKeyName] = "random";
			const model = aJsonModel(inputModel);
			expect(model).toBeDefined();
			expect((<any>model)[nonExistingKeyName]).not.toBeDefined();
		});
	});

	describe("AJsonModel", () => {
		it("should work exactly like above", () => {
			const model = new AJsonModel();
			expect(model).toBeDefined();
			expect(model.key1).toBe("value 1");
		});
	});
});
