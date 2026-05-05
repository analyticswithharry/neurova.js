import { ulid } from 'ulid'

/** Generate a sortable ULID identifier. */
export function id(prefix?: string): string {
  const value = ulid()
  return prefix ? `${prefix}_${value}` : value
}

/** RFC 4122 v4 UUID using crypto.randomUUID when available. */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback (very unlikely path on supported runtimes).
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** Short, URL-safe id (nanoid-style, no extra dependency). */
export function shortId(size = 12): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  const bytes = new Uint8Array(size)
  if (typeof crypto !== 'undefined') crypto.getRandomValues(bytes)
  else for (let i = 0; i < size; i++) bytes[i] = Math.floor(Math.random() * 256)
  for (let i = 0; i < size; i++) out += alphabet[bytes[i]! % alphabet.length]
  return out
}
