import { describe, expect, it } from 'vitest'
import { EventBus, NeurovaError, Ok, ValidationError, id, parse, tryCatch, z } from '../src'

describe('@neurova/core', () => {
  it('NeurovaError serializes', () => {
    const err = new NeurovaError('boom', { code: 'X', status: 418 })
    expect(err.toJSON()).toMatchObject({ code: 'X', status: 418, message: 'boom' })
  })

  it('parse throws ValidationError on bad input', () => {
    const schema = z.object({ name: z.string() })
    expect(() => parse(schema, { name: 1 })).toThrow(ValidationError)
  })

  it('id returns ULID with optional prefix', () => {
    expect(id()).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
    expect(id('user')).toMatch(/^user_[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('EventBus fans out', () => {
    const bus = new EventBus<{ ping: number }>()
    const seen: number[] = []
    bus.on('ping', (n) => seen.push(n))
    bus.emit('ping', 1)
    bus.emit('ping', 2)
    expect(seen).toEqual([1, 2])
  })

  it('Result + tryCatch', () => {
    const r = tryCatch(() => 42)
    expect(r).toEqual(Ok(42))
  })
})
