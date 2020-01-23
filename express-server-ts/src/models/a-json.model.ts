export { aJsonModel };

function aJsonModel(model = <any>{}) {
	return {
		key1: model.key1 || "value 1",
		"key 2": model["key 2"] || "value 2"
	};
}
