/**
 * neurova — the unified framework entry point.
 *
 * Subpath imports recommended for tree-shaking:
 *   import { chat } from 'neurova/ai'
 *   import { Button } from 'neurova/ui'
 *   import { createServer } from 'neurova/backend'
 *   import { id, logger } from 'neurova/core'
 */
export * as core from '@neurova/core'
export * as ai from '@neurova/ai'
export * as backend from '@neurova/backend'
export * as ui from '@neurova/ui'
export * as runtime from '@neurova/runtime'
export const NEUROVA_VERSION = '2.2.2'
