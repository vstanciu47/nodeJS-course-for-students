# [NodeJs API for a .NET developer](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer)



## 06. Modules, packages, libraries

### Modules

Module is a file in javascript (or typescript). In browser, modules can be loaded multiple ways, the most known being with the `<script>` tag.
We don't do this in practice now, because we write "single file single responsability" type code, and that means a lot of files interdependent.
It is a nuicance to manually add these to the index.html and to update them, but it is even worse when they need to be loaded in the correct order to satisfy the dependency chain.
To avoid this, module loaders have been created. These handle the "import" type dependencies of the first file and make requests to load them first, then make the module available.
Of corse, some of the dependencies have their own deps, so those are loaded in the right order as well.
At the end, the module loader resolve all the dependencies required and the correct order and then runs the code.

The same process is happening in Node as well when you run a file.

There are different module loading types available, like `commonjs` used by Node, `amd`, `umd`, `es2015` (or `es6`), `System`, etc.
The modules use different javascript syntax under the hood.
For example in `amd`, an module looks like this:
```javascript
define(['path/to/my/dependency'], function (mydependency) {
	// 
});
```
So `define` is a function tht gets two params: one is a list of file paths that are coming from `import x from "y"` syntax that we write,
and the second is a function callback that is the module we wrote and it gets injected with the exported objects (if any) from the dependency.

In `commonjs`, the `define` function is not even available to us, but it's there and it gets us some implicit objects injected, like `module`, `exports`, `global`, etc.
Also, the syntax for importing dependencies is `require`, like we've used in the js app.

Since we moved to typescript, we've switched to typescript's syntax, `import`.

Typescript uses `import` keyword because that is also the syntax used in `ES6`, and since typescript is a superset of javascript, it also uses it.

Transpiling the .ts takes care of the conversion for us; it uses the `target` prop from the `tsconfog.json` to read the javascript module loading type that we want to produce.

### Packages, libraries
Modules are considered files that we write ourselves for the project and files that come with Node itself.
Packages or libraries are third party dependencies that we add to a project, but native modles are also refered to as packages or libraries.
Packages or libraries are also modules, and sometimes people refer to them as 'modules'.

This is just common terminology, there is no real standard for naming these, so you will most likely encounter all terms used for all types of dependencies.

### node_modules
Did you notice that a `node_modules` folder got created as soon as we installed the first "package" / "library" / "module" ?
We installed `express` "library" and `npm` saved it under `node_modules` folder. So `npm` names all just "modules".

Have you noticed that although we added just one "library", a lot more "node modules" appeared? This is because `express` has its own dependencies that need to be added locally for it to work. Those aren't listed automatically in `package.json` because we're not managing them, `npm` is. This is BTW why `node_modules` grows that big, dependencies require extra dependencies.

In production, we use a bundler who's job is to extract only those functions that are actually used and put them into a single file, greatly reducing the size and the number of files that the app will need to load.



[Next: mongodb + ORM](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer/browse/docs/07-mongodb-orm.md)
