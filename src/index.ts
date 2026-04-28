import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire, InitializeHook, LoadHook, Module, ResolveHook } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as yaml from 'js-yaml'
import toSource from 'tosource'

const fileUrl = typeof import.meta.url === 'string' ? import.meta.url : pathToFileURL(__filename).href
const require = createRequire(fileUrl)

// for esm
// Module.register is only available in Node.js v20.6.0 or later
// https://nodejs.org/api/module.html#moduleregisterspecifier-parenturl-options
Module.register?.(fileUrl)

// for cjs
for (const extname of ['.yml', '.yaml']) {
  // eslint-disable-next-line n/no-deprecated-api
  require.extensions[extname] = (module, filename) => {
    const source = readFileSync(filename, 'utf8')
    module.exports = yaml.load(source)
  }
}

export const initialize: InitializeHook = async () => {}

export const resolve: ResolveHook = async (specifier, context, next) => {
  return next(specifier, context)
}

export const load: LoadHook = async (url, context, next) => {
  if (url.endsWith('.yml') || url.endsWith('.yaml')) {
    const content = await readFile(fileURLToPath(url), 'utf8')
    const source = 'export default ' + toSource(yaml.load(content))
    // JSON modules is experimental, so we just use `module` format
    return { format: 'module', source, shortCircuit: true }
  } else {
    return next(url, context)
  }
}
