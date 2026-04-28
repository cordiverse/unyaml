import * as yaml from 'js-yaml'
import toSource from 'tosource'
import { TransformResult } from 'rollup'
import esbuildPlugin from './esbuild'

namespace unyaml {
  export interface Options extends Omit<yaml.LoadOptions, 'filename'> {
    /**
     * Filter regular expression matched against the resolved id.
     * @default /\.ya?ml(?:\?.*)?$/
     */
    filter?: RegExp
  }

  export interface Plugin {
    name: string
    config?: () => any
    transform?: (code: string, id: string) => TransformResult
  }
}

function unyaml(options: unyaml.Options = {}): unyaml.Plugin {
  const { filter = /\.ya?ml(?:\?.*)?$/, ...loadOptions } = options
  return {
    name: 'unyaml',
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [esbuildPlugin({ filter, ...loadOptions })],
          },
        },
      }
    },
    transform(code, id) {
      if (!filter.test(id)) return
      const data = yaml.load(code, { ...loadOptions, filename: id })
      return {
        code: `export default ${toSource(data)}`,
        map: { mappings: '' },
      }
    },
  }
}

export = unyaml
