import { readFileSync } from 'node:fs'
import Module, { createRequire, registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'
import * as yaml from 'js-yaml'

const extensions = ['.yml', '.yaml']

const fileUrl = typeof import.meta.url === 'string' ? import.meta.url : pathToFileURL(__filename).href
const yamlPath = createRequire(fileUrl).resolve('js-yaml')

// for cjs
// Registered extensions take part in the extension probing of `require()`,
// which the synchronous hooks do not provide.
for (const extname of extensions) {
  // eslint-disable-next-line n/no-deprecated-api
  (Module as any)._extensions[extname] = (module: Module, filename: string) => {
    module.exports = yaml.load(readFileSync(filename, 'utf8'))
  }
}

// for esm
// The generated module parses the file when it is evaluated, so the parsed value
// keeps its keys, types and aliases, and is owned by the module cache of Node.js.
// https://nodejs.org/api/module.html#moduleregisterhooksoptions
registerHooks({
  load(url, context, next) {
    if (!extensions.some(ext => url.endsWith(ext))) return next(url, context)
    const source = `module.exports = require(${JSON.stringify(yamlPath)}).load(require('node:fs').readFileSync(__filename, 'utf8'))`
    return { format: 'commonjs', source, shortCircuit: true }
  },
})
