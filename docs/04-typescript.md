# [NodeJs API for a .NET developer](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer)



## 04. Typescript

### Quick intro
So far we have written pure javascript, which is what Node understands.
Javascript was born many years ago and the original specs were defined in three days. Future iterations of the specs added more features, but because the web was already using this rather new technology, the existing specs were not modified, to remain backword compatible.
For that reason, javascript can still "do" things that must be avoided.
[Typescript](https://www.typescriptlang.org/) was created to bring the order to javascript language; it's top two features are the ability to add types to js, but also to guard against unpredictable usage of the language.

Here's an example that is valid in javascript:
```javascript
function timesTwo(v) { return v * 2; }
var x = timesTwo("one");
x = x + 1;
console.log(x);
```
What do you think this will do? Cause an error? No! it will print NaN (not a number) which is a type, thus a "real" value, and even worse it's type is "number".

Here's the same example in typescript:
```typescript
function timesTwo(v) { return v * 2; }
var x = timesTwo("one");
x = x + 1;
console.log(x);
```
I have copied the .js file from above and changed its extension to .ts, that is all it takes to bring *some* of the typescript's capabilities to javascript.
If I run the typescript compiler with no options, it will just produce the javascript file as above.
So what is the benefit then? Let's make a couple of changes: specify that the input parameter of function `addOne` is number, and make the x var a const:
```typescript
function timesTwo(v: number) { return v * 2; }
const x = timesTwo("one");
x = x + 1;
console.log(x);
```
This time the comppiler displays two errors:
```shell
04-ts-02.ts(2,20): error TS2345: Argument of type '"one"' is not assignable to parameter of type 'number'.
04-ts-02.ts(3,1): error TS2540: Cannot assign to 'x' because it is a constant or a read-only property.
```
If we would use aa IDE with typescript support instead of a plain text editor, these would also be highlighted.
I am using [Visual Studio](https://visualstudio.microsoft.com/downloads/) with "Node.js development" component installed and [TypeScript 3.7.2 for Visual Studio](https://www.typescriptlang.org/index.html#download-links),
but you can also use [VS code](https://code.visualstudio.com/) or any other IDE that you prefer.

### Convert our Node app to typescript
Let's make our source files typescript: first copy the entire `express-server-js` as `express-server-ts`, then change all .js file extensions to .ts (there are 9)

Switch to the new dir and try to run `npm start` again. Of course it doesn't work, we've just renamed the `index.js` to `index.ts`.
So we'll need to compile (or "transpile") the ts files, using typescript. Let's install the package as dev dependency `npm i -D typescript`.
Let's also install a dev dependency package to run our app in dev mode `npm i -D ts-node-dev`. This allows us to run the app without pre-transpiling, as it does it automatically for us (it will stop if any errors are found)
Let's add a new script to `package.json`: `"ts:node:dev": "ts-node-dev src/index --watch",` and change the start script in  to `npm run ts:node:dev`; since we're here, let's remove the `main` entry, we'll never use it again.
Try `npm start`...it works again! We've added a `--watch` flag to `ts-node-dev` so when we update any file, it will re-transpile them and restart the server, giving us the ability to concentrate on writing code.

I've mentioned above that running the compiler with no option will not add to much value, so now we want to instruct the compiler to use more strict rules.
This is done by adding a [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) file at the root of the project (where `package.json` is).
Go ahead and copy the one from the repo. There are a few options that are I personally use all the time, but for the full list of available options and their meaning, go to the link on top of the file.

Let's add a new script in `package.json`: `"type:check": "tsc --noEmit --project .",` and update the start script to `"start": "npm run type:check && npm run ts:node:dev",`
The new script does a "dry run", meaning it does everything except writing the javascript files to disk; we still don't need them because for simplicity, in dev mode we run the app through `ts-node-dev` using the source .ts files.
We're ready to "transpile" using the typescript comppiler with run `npm run type:check` and boy we're in for a nasty surprise! I can't even count the errors displayed!
I'm absolutely sure I'm a good developer, I certainly can't make tht many mistakes!
So our conversion form .js to .ts wasn't this simple, I guess...
Let's continue with the conversion (and again I strongly encourage you to do it yourself):
- update imports like below, depending on the usage (more about these in next part)
  - `const x = require("y")` to `import * as x from "y";`
  - `const { x } = require("y")` to `import { x } from "y";`
- update exports
  - `module.exports.x = x;` to `export { x };`
  - if more than one object exported, add them to the main export object like this `export { x, y };`

Ok, that took a few minutes. Are we done yet? Run `npm run type:check` again. That looks a bit better. Let's see what's still wrong.

The first error I see is `Could not find a declaration file for module 'express'`. And this makes sense, we've added the package to the project, but all packages are written for javascript and typescript cannot tell what types it uses and needs.

For this, type packages are being created separately. Install type packages with `npm i -D @types/express`.

We also need to add typings for node's native modules `npm i -D @types/node@12`; I've specified the version of node I want types for, that is v12, which is the LTS version I have installed.

A lot of errors are for `Variable 'x' implicitly has an 'any' type`.
Type `any` is assumed if no specific type is provided, and we should always forbid this (the rule is specified in `tsconfig.json` with `"noImplicitAny": true,`).
Type `any` is useful in some edge cases. But it mutes all the benefits of typescript.

We'll add required type declarations to fix `no implicit any` errors:
- app object in `app.ts` is of type `let app: express.Application;`
- `req`, `res`, `next` objects in `app.ts`,`a-json.route.ts`, `discovery-client.route.ts` are of types `req: express.Request, res: express.Response, next: express.NextFunction`
- `err` object in `app.ts` is of type `app.use((err: Error,...`
- `model` object in `a-json.model.ts` is of type `model = <any>{}`; this is a good example where `any` type can come in handy: when we don't know what data we receive from external sources
- `message` object in `log.ts` is of type `log(message: Error | string)`. This is a union type where we tell the compiler that the variable can be of either type at runtime.

Run `npm run type:check` again; this time we only see a few errors, that we'll fix next.

In `app.ts` we add and read a property `status` to an `Error` object;
this is possible in javascript but forbidden in typescript because it can have unpredictable consequences.
Let's use an interface instead in `interfaces/IExpressError.ts`, import it, and use it
`const err = new Error("Not Found") as IExpressError;`
`app.use((err: IExpressError, ...`

Now we're left with the errors in `a-json.model.ts`.
The function return works with the compiler, because the return type is inferred.
But in the case of the class, it behaves exactly like in C#, it says that props do not exist on the object, so they have to be declared explicitely:
```typescript
class AJsonModel {
	key1: string;
	"key 2": string;
```

And that concludes the transformation of the javascript files to typescript with enough restrictions to prevent most mistakes.
If using Visual Studio with typescript support, writing typescript is the same as writing C#, we have the same kind of tools available and the same kind of compilation. We have intellisense, syntax issues highlight, errors, etc.

We should ignore the generated files (like bin) so we'll add a `.gitignore` file for it.

So far we've ensured we don't make *some* mistakes. We will add another great tool to check for code style and consistency, `npm i -D tslint`.
Tslint works with its own `tslint.json` config, so copy the one from the repo to your project. There are tons of options available, I personally use this configuration for my projects.
For a list of all options and what they're for, read the official [docs](https://palantir.github.io/tslint/rules/).
Let's add a new script for this in `package.json`: `"lint": "tslint --project .",` and update the start script to run it `npm run type:check && npm run lint && npm run ts:node:dev`
Let's see if we wrote good style code: `npm run lint`.
Not too bad, I have a 4 errors.
- The trailing white space error is an easy fix.
- The forbidden `eval` error in `log.ts`
  - eval is used here to prevent bundlers (that we'll use in production) to clean up 'useless' console.log statements
  - eval is preventing any checks on the code run, so it shouldn't be used
  - because we're just wrapping harmless console.log in eval, we'll allow the rule for this case only: add `// tslint:disable:no-eval` before the block start and `// tslint:enable` after
- The use before declaration in `a-json.model`
  - it can be ignored, because classes are just functions that are defined by js engine on the first compile stage, so they're made available when they exist
  - go ahead and disable the `no-use-before-declare` rule for the export line alone

Run `npm start` again to see the complete check running (hopefully with no errors) and server starting up again in watch mode.



[Next: debugging Node.js apps](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer/browse/docs/05-debugging.md)
