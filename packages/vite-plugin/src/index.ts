/**
 * @neurova/vite-plugin
 *
 * Compiles .nv source files on the fly via @neurova/compiler.
 */
import { compile, type EmitTarget } from '@neurova/compiler'

export interface NeurovaPluginOptions {
  /** Codegen target. Defaults to "runtime". */
  target?: EmitTarget
  /** File extensions to handle. Defaults to [".nv"]. */
  extensions?: string[]
  /** Override the @neurova/runtime module specifier. */
  runtimeModule?: string
}

interface ViteLikePlugin {
  name: string
  enforce?: 'pre' | 'post'
  transform(
    code: string,
    id: string,
  ): { code: string; map: null } | null
}

export default function neurova(options: NeurovaPluginOptions = {}): ViteLikePlugin {
  const target = options.target ?? 'runtime'
  const exts = options.extensions ?? ['.nv']

  return {
    name: 'neurova',
    enforce: 'pre',
    transform(code, id) {
      const cleanId = id.split('?')[0] ?? id
      if (!exts.some((ext) => cleanId.endsWith(ext))) return null
      const result = compile(code, {
        target,
        runtimeModule: options.runtimeModule,
        tsNoCheck: true,
      })
      return { code: result.code, map: null }
    },
  }
}

export { neurova }
