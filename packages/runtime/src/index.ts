/**
 * @neurova/runtime
 *
 * Original reactive runtime + DOM renderer for neurova framework.
 * Authored by @analyticswithharry and Squid Consultancy Group Ltd.
 * MIT licensed.
 */

export {
  signal,
  effect,
  computed,
  batch,
  untrack,
  type Signal,
} from './reactivity.js'

export {
  h,
  mount,
  For,
  type Child,
  type Props,
  type Component,
} from './dom.js'

export const VERSION = '0.1.0'
export const FRAMEWORK_NAME = 'neurova'
