/**
 * Image class — port of `neurova.core.image.Image`.
 *
 * Memory layout: row-major Uint8ClampedArray, stride = width * channels.
 * Channel order: BGR by default (matches OpenCV / Python neurova).
 */

export type ColorOrder = 'BGR' | 'RGB' | 'GRAY' | 'BGRA' | 'RGBA'

export interface ImageOptions {
  width: number
  height: number
  channels?: number
  colorOrder?: ColorOrder
  data?: Uint8ClampedArray | Uint8Array
}

export class Image {
  readonly width: number
  readonly height: number
  readonly channels: number
  readonly colorOrder: ColorOrder
  readonly data: Uint8ClampedArray

  constructor(opts: ImageOptions) {
    this.width = opts.width
    this.height = opts.height
    this.colorOrder = opts.colorOrder ?? 'BGR'
    this.channels = opts.channels ?? channelsFor(this.colorOrder)
    const expected = this.width * this.height * this.channels
    if (opts.data) {
      if (opts.data.length !== expected) {
        throw new Error(`data length ${opts.data.length} != ${expected}`)
      }
      this.data = opts.data instanceof Uint8ClampedArray
        ? opts.data
        : new Uint8ClampedArray(opts.data.buffer, opts.data.byteOffset, opts.data.byteLength)
    } else {
      this.data = new Uint8ClampedArray(expected)
    }
  }

  pixel(x: number, y: number): number[] {
    const off = (y * this.width + x) * this.channels
    const out: number[] = []
    for (let c = 0; c < this.channels; c++) out.push(this.data[off + c]!)
    return out
  }

  setPixel(x: number, y: number, values: number[]): void {
    const off = (y * this.width + x) * this.channels
    for (let c = 0; c < this.channels; c++) this.data[off + c] = values[c] ?? 0
  }

  clone(): Image {
    return new Image({
      width: this.width, height: this.height, channels: this.channels,
      colorOrder: this.colorOrder, data: new Uint8ClampedArray(this.data),
    })
  }
}

function channelsFor(order: ColorOrder): number {
  switch (order) {
    case 'GRAY': return 1
    case 'BGRA': case 'RGBA': return 4
    default: return 3
  }
}
