const aJsonData = require("../data/a-json.data");

module.exports.getAJson = getAJson;

function getAJson() {
	// get the data from the persistence; this can be from memory, a file on disk, a db
	// validate data, aggregate it, return it
	return aJsonData.getAJson();
}
