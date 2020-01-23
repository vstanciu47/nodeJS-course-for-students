import { env } from "./env";
import { makeApp } from "./app";
const { log } = require("./log");

makeApp().listen(env.PORT, () => log(`${env.NODE_ENV} server listening on port ${env.PORT}`));
