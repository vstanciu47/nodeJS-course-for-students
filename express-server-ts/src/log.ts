module.exports.log = log;

function log(message) {
	if (message instanceof Error)
		eval(`console.error("${String(message)}")`);
	else
		eval(`console.log("${message}")`);
}
