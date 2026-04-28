import { readFile } from 'node:fs/promises'
import type { PluginBuild } from 'esbuild'
import * as yaml from 'js-yaml'
import toSource from 'tosource'

namespace unyaml {
  export interface Options extends Omit<yaml.LoadOptions, 'filename'> {
    /**
     * Filter regular expression matched against the resolved path.
     * @default /\.ya?ml$/
     */
    filter?: RegExp
  }

  export interface Plugin {
    name: string
    setup(build: any): void
  }
}

function unyaml(options: unyaml.Options = {}): unyaml.Plugin {
  const { filter = /\.ya?ml$/, ...loadOptions } = options
  return {
    name: 'unyaml',
    setup(build: PluginBuild) {
      build.onLoad({ filter }, async (args: { path: string }) => {
        const text = await readFile(args.path, 'utf8')
        const data = yaml.load(text, { ...loadOptions, filename: args.path })
        return {
          contents: `export default ${toSource(data)}`,
          loader: 'js',
        }
      })
    },
  }
}

export = unyaml
