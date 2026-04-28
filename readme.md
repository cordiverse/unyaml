# unyaml

[![downloads](https://img.shields.io/npm/dm/unyaml?style=flat-square)](https://www.npmjs.com/package/unyaml)
[![npm](https://img.shields.io/npm/v/unyaml?style=flat-square)](https://www.npmjs.com/package/unyaml)
[![GitHub](https://img.shields.io/github/license/shigma/unyaml?style=flat-square)](https://github.com/shigma/unyaml/blob/master/LICENSE)

Universal YAML loader. Works in Node.js (CJS `require` / ESM `import`), [esbuild](https://esbuild.github.io/) and [Vite](https://vitejs.dev/) — one package, one mental model.

## Node.js

### From CLI

CJS:

```sh
node -r unyaml path/to/index.cjs
```

ESM (Node.js 20.6.0 or later):

```sh
node --import unyaml path/to/index.mjs
```

### Manually import

CJS:

```js
require('unyaml')
require('path/to/file.yml') // now it works!
```

ESM:

```js
import 'unyaml'
const data = await import('path/to/file.yml')
```

## esbuild

```js
import esbuild from 'esbuild'
import unyaml from 'unyaml/esbuild'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  plugins: [unyaml()],
})
```

`.yml` / `.yaml` imports are loaded, parsed and inlined as JSON modules.

### Options

```ts
unyaml({
  filter?: RegExp                  // default: /\.ya?ml$/
  // ...plus any js-yaml LoadOptions (schema, json, onWarning, ...)
})
```

## Vite

```js
// vite.config.ts
import { defineConfig } from 'vite'
import unyaml from 'unyaml/vite'

export default defineConfig({
  plugins: [unyaml()],
})
```

The Vite plugin handles both the main pipeline **and** the esbuild-based dependency pre-bundling (`optimizeDeps`), so importing YAML from inside `node_modules` works out of the box.

### Options

```ts
unyaml({
  filter?: RegExp                  // default: /\.ya?ml(?:\?.*)?$/
  // ...plus any js-yaml LoadOptions (schema, json, onWarning, ...)
})
```

## TypeScript support

To silence `Cannot find module 'file.yml' or its corresponding type declarations.` errors, add `unyaml/types` to `compilerOptions.types` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": [
      "unyaml/types"
    ]
  }
}
```

