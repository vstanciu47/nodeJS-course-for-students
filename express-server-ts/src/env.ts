const env = getEnv();

export { env };

function getEnv() {
	// use process.env, process.argv
	return {
		PORT: 58080,

		NODE_ENV: "development",

		DISCOVERY_CLIENT_ROUTE: "/discovery/client",
		A_JSON_ROUTE: "/api/json"
	};
}
