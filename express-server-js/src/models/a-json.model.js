module.exports.aJsonModel = aJsonModel;

// we can construct objects multiple ways, two of which are shown below

// function return
function aJsonModel(model = {}) {
	return {
		key1: model.key1 || "value 1",
		"key 2": model["key 2"] || "value 2"
	};
}

// newable classes
class AJsonModel {
	constructor(model = {}) {
		this.key1 = model.key1 || "value 1";
		this["key 2"] = model["key 2"] || "value 2";
	}
}

// a "gotcha" for class though is that it can be added to exports only after the implementation
module.exports.AJsonModel = AJsonModel;
