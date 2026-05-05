/**
 * Re-export zod under the neurova namespace so consumers don't need a direct
 * dependency. Add neurova-specific helpers here.
 */
export { z } from 'zod'
import type { ZodTypeAny, z } from 'zod'
import { ValidationError } from './errors'

export type Schema<T> = z.ZodType<T>

/**
 * Parse + throw NeurovaError on failure (typed).
 */
export function parse<S extends ZodTypeAny>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new ValidationError('Validation failed', { issues: result.error.issues })
  }
  return result.data
}

/**
 * Safe parse — returns Result-like tuple `[error, value]`.
 */
export function safeParse<S extends ZodTypeAny>(
  schema: S,
  value: unknown,
): [ValidationError, null] | [null, z.infer<S>] {
  const result = schema.safeParse(value)
  if (!result.success) {
    return [new ValidationError('Validation failed', { issues: result.error.issues }), null]
  }
  return [null, result.data]
}
