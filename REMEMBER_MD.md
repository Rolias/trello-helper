# Things to Remember

I want to document the slightly unusual things about this project,
and the things I feel I'm likely to forget. This was my first real typescript
project.

## Location of `tsconfig.json`

At one point I moved `tsconfig.json` from the root level of the project. It would create `./build/src/*.js` for all the transpiled files. Since I wanted the files under `./build/*.js` the first way I found to do it was move the `tsconfig.json` file into my `./src` folder. I then tell tsc where the file is with the build script

```json
"build": "tsc -p ./src ",
```

and everything worked. The problem is that wreaked havoc with some other tooling that was expecting to find that file at the root level of the project. Notably the ts-node package and typedoc needed to have flags specify the location of `tsconfig.json` and some commands would need things like `--config 'src/tsconfig.json'` in various `package.json` scripts.

I eventually moved tsconfig.json back to the root folder and added the `rootDir` setting and that was a better way to solve the problem

## ts-node and Unit Testing

I am using a package named ts-node that in effect does transpilation on the fly. This allows the unit tests to run kinda sorta directly on the typescript. The result is that when errors happen in tests the links in the errors link back to the typescript files rather than the built javascript files. Both mocha and nyc need to have ts-node "registered" The `package.json` file has an `nyc` section that does this. Mocha has a `.mocharc.js` configuration file that does it.

### More stuff related to moving the tsconfig.json file

Once registered ts-node would look for `tsconfig.json` in the root and if not found will use defaults. One of those defaults is `es5` and my code is written for `es6`. So if you run and get errors about `I.SomeInterface` and mentions of es3 or es5, what's happening is ts-node is not finding the tsconfig.json file. It looks for an environment variable named `TS_NODE_PROJECT` to locate the file. There used to be a script

```json
  "setEnv": "TS_NODE_PROJECT='src/tsconfig.json'",
```

that was run from the test script `npm run setEnv mocha`. Other scripts would use the test script. This would set up that environment variable in the needed places. Again no longer needed.

## Documentation

I'm using `typedoc` to auto generate documentation based on the TypeScript typing info. I created interfaces for just about everything I pass as a parameter. If I didn't then literal objects passed in just showed up as `Object` in the typedoc docs. Now they show up as the interface name with a link to the details on the structure expected for the object.
TODO - move the docs to github
