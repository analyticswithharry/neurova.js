import { describe, it, expect } from 'vitest'
import { Image, toGrayscale, swapChannels, boxBlur, gaussianBlur, threshold, resize, flipHorizontal, flipVertical } from '../src'

function solidBgr(w: number, h: number, b: number, g: number, r: number): Image {
  const data = new Uint8ClampedArray(w * h * 3)
  for (let i = 0; i < data.length; i += 3) { data[i] = b; data[i + 1] = g; data[i + 2] = r }
  return new Image({ width: w, height: h, colorOrder: 'BGR', data })
}

describe('Image', () => {
  it('defaults to BGR with 3 channels', () => {
    const img = new Image({ width: 2, height: 2 })
    expect(img.colorOrder).toBe('BGR')
    expect(img.channels).toBe(3)
    expect(img.data.length).toBe(12)
  })

  it('pixel/setPixel roundtrip', () => {
    const img = new Image({ width: 2, height: 2 })
    img.setPixel(1, 1, [10, 20, 30])
    expect(img.pixel(1, 1)).toEqual([10, 20, 30])
  })
})

describe('color', () => {
  it('toGrayscale on solid BGR matches BT.601', () => {
    // Pure red in BGR = [0, 0, 255]; gray ≈ 0.299 * 255 ≈ 76
    const gray = toGrayscale(solidBgr(2, 2, 0, 0, 255))
    expect(gray.colorOrder).toBe('GRAY')
    expect(gray.data[0]).toBeCloseTo(76, -1)
  })

  it('swapChannels flips BGR <-> RGB', () => {
    const bgr = solidBgr(1, 1, 1, 2, 3)  // B=1, G=2, R=3
    const rgb = swapChannels(bgr)
    expect(rgb.colorOrder).toBe('RGB')
    expect(Array.from(rgb.data)).toEqual([3, 2, 1])
  })
})

describe('filters', () => {
  it('boxBlur preserves a constant image', () => {
    const img = solidBgr(5, 5, 100, 100, 100)
    const out = boxBlur(img, 3)
    expect(Array.from(out.data.slice(0, 3))).toEqual([100, 100, 100])
  })

  it('gaussianBlur preserves a constant image', () => {
    const img = solidBgr(5, 5, 50, 50, 50)
    const out = gaussianBlur(img, 1.0)
    expect(out.data[12]).toBeCloseTo(50, -1)
  })

  it('threshold binarizes a grayscale image', () => {
    const data = new Uint8ClampedArray([10, 200, 50, 255])
    const img = new Image({ width: 2, height: 2, colorOrder: 'GRAY', data })
    const out = threshold(img, 100)
    expect(Array.from(out.data)).toEqual([0, 255, 0, 255])
  })
})

describe('transform', () => {
  it('resize halves width', () => {
    const img = solidBgr(4, 4, 1, 2, 3)
    const out = resize(img, 2, 2)
    expect(out.width).toBe(2); expect(out.height).toBe(2)
    expect(Array.from(out.data.slice(0, 3))).toEqual([1, 2, 3])
  })

  it('flipHorizontal mirrors columns', () => {
    const data = new Uint8ClampedArray([1, 0, 0, 2, 0, 0])  // BGR (1, 0, 0) and (2, 0, 0)
    const img = new Image({ width: 2, height: 1, colorOrder: 'BGR', data })
    const out = flipHorizontal(img)
    expect(Array.from(out.data)).toEqual([2, 0, 0, 1, 0, 0])
  })

  it('flipVertical mirrors rows', () => {
    const data = new Uint8ClampedArray([1, 1, 1, 2, 2, 2])
    const img = new Image({ width: 1, height: 2, colorOrder: 'BGR', data })
    const out = flipVertical(img)
    expect(Array.from(out.data)).toEqual([2, 2, 2, 1, 1, 1])
  })
})
