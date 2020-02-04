# [NodeJs API for a .NET developer](../README.md)



## 05. Debugging Node.js apps

First we add a feature usefull for debugging: in `tsconfig.json`, change `"sourceMap": true,`.
This will create .js.map files that connect the source .ts files to the emitted .js files, to allow debugging into the source files, not generated files.

Next we enable the inspection option to out our server: in `package.config`, update script `"ts:node:dev": "ts-node-dev --inspect --watch -- src/index",`

Run `npm start` as usual. You should see a message like `Debugger listening on ws://127.0.0.1 ...`

Open chrome and go to `chrome://inspect/` and wait a couple of seconds for your project to appear under remote devices, then click inspect.
You should already see the node console messages in chrome console; you can debug your code just like you debug a website now.



[Next: modules, packages, libraries](06-modules-packages-libraries.md)
