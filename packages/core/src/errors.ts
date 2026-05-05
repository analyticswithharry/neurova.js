/**
 * Base error class for the neurova ecosystem. All thrown errors should extend
 * this so callers can rely on `error.code` and structured `cause`.
 */
export class NeurovaError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(
    message: string,
    options: {
      code?: string
      status?: number
      cause?: unknown
      details?: Record<string, unknown>
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = this.constructor.name
    this.code = options.code ?? 'NEUROVA_ERROR'
    this.status = options.status ?? 500
    this.details = options.details
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      status: this.status,
      message: this.message,
      details: this.details,
    }
  }
}

export class ValidationError extends NeurovaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { code: 'NEUROVA_VALIDATION', status: 400, details })
  }
}

export class NotFoundError extends NeurovaError {
  constructor(message = 'Not found', details?: Record<string, unknown>) {
    super(message, { code: 'NEUROVA_NOT_FOUND', status: 404, details })
  }
}

export class UnauthorizedError extends NeurovaError {
  constructor(message = 'Unauthorized') {
    super(message, { code: 'NEUROVA_UNAUTHORIZED', status: 401 })
  }
}

export class ForbiddenError extends NeurovaError {
  constructor(message = 'Forbidden') {
    super(message, { code: 'NEUROVA_FORBIDDEN', status: 403 })
  }
}

export class RateLimitError extends NeurovaError {
  constructor(message = 'Too many requests') {
    super(message, { code: 'NEUROVA_RATE_LIMIT', status: 429 })
  }
}

export class TimeoutError extends NeurovaError {
  constructor(message = 'Operation timed out') {
    super(message, { code: 'NEUROVA_TIMEOUT', status: 408 })
  }
}

export function isNeurovaError(value: unknown): value is NeurovaError {
  return value instanceof NeurovaError
}
