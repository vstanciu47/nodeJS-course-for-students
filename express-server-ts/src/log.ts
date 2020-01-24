export { log };

function log(message: Error | string) {
	// tslint:disable:no-eval
	if (message instanceof Error)
		eval(`console.error("${String(message)}")`);
	else
		eval(`console.log("${message}")`);
	// tslint:enable
}
