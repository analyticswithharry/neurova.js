/**
 * Result<T, E> — explicit success / failure container, useful at boundaries
 * where you don't want to throw.
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error })

export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return Ok(fn())
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)))
  }
}

export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    return Ok(await fn())
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)))
  }
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value
  throw result.error
}
