// tslint:disable:no-use-before-declare
export { aJsonModel, AJsonModel };
// tslint:enable

// we can construct objects multiple ways, two of which are shown below

// function return
function aJsonModel(model = <any>{}) {
	return {
		key1: model.key1 || "value 1",
		"key 2": model["key 2"] || "value 2"
	};
}

// newable classes
class AJsonModel {
	key1: string;
	"key 2": string;

	constructor(model = <any>{}) {
		this.key1 = model.key1 || "value 1";
		this["key 2"] = model["key 2"] || "value 2";
	}
}
