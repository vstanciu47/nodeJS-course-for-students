import * as aJsonModel from "../models/a-json.model";

export { getAJson };

function getAJson() {
	// get data
	const obj = {
		key1: "value 1",
		// "key 2": "value 2", // "key 2" is excluded on purpose, this is a valid case where the data may not contain it
		nonExistingModelProp: "who cares" // key does not exist in the model, but the data may contain it
	};

	// construct the model from data
	const ret = aJsonModel.aJsonModel(obj);

	return ret;
}
