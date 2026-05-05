/**
 * Filters. Port of subset of `neurova.filters`.
 */
import { Image } from './image'

/** Box blur with a square kernel of side `size` (odd). */
export function boxBlur(img: Image, size: number = 3): Image {
  if (size % 2 === 0) throw new Error('size must be odd')
  const half = (size - 1) / 2
  const out = new Uint8ClampedArray(img.data.length)
  const w = img.width, h = img.height, c = img.channels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let ch = 0; ch < c; ch++) {
        let s = 0, n = 0
        for (let dy = -half; dy <= half; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= h) continue
          for (let dx = -half; dx <= half; dx++) {
            const xx = x + dx
            if (xx < 0 || xx >= w) continue
            s += img.data[(yy * w + xx) * c + ch]!; n++
          }
        }
        out[(y * w + x) * c + ch] = s / n
      }
    }
  }
  return new Image({ width: w, height: h, channels: c, colorOrder: img.colorOrder, data: out })
}

/** Gaussian blur. Separable kernel for speed. */
export function gaussianBlur(img: Image, sigma: number = 1.0, size?: number): Image {
  const ksize = size ?? Math.max(3, (Math.floor(sigma * 6) | 1))
  if (ksize % 2 === 0) throw new Error('size must be odd')
  const half = (ksize - 1) / 2
  const kernel = new Float32Array(ksize)
  let total = 0
  for (let i = 0; i < ksize; i++) {
    const x = i - half
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma))
    total += kernel[i]!
  }
  for (let i = 0; i < ksize; i++) kernel[i]! /= total
  return separableConvolve(img, kernel)
}

function separableConvolve(img: Image, kernel: Float32Array): Image {
  const half = (kernel.length - 1) / 2
  const w = img.width, h = img.height, c = img.channels
  const tmp = new Float32Array(img.data.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let ch = 0; ch < c; ch++) {
        let s = 0
        for (let k = -half; k <= half; k++) {
          const xx = Math.min(w - 1, Math.max(0, x + k))
          s += img.data[(y * w + xx) * c + ch]! * kernel[k + half]!
        }
        tmp[(y * w + x) * c + ch] = s
      }
    }
  }
  const out = new Uint8ClampedArray(img.data.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (let ch = 0; ch < c; ch++) {
        let s = 0
        for (let k = -half; k <= half; k++) {
          const yy = Math.min(h - 1, Math.max(0, y + k))
          s += tmp[(yy * w + x) * c + ch]! * kernel[k + half]!
        }
        out[(y * w + x) * c + ch] = s
      }
    }
  }
  return new Image({ width: w, height: h, channels: c, colorOrder: img.colorOrder, data: out })
}

/** Threshold a grayscale image to {0, 255}. */
export function threshold(img: Image, t: number): Image {
  if (img.colorOrder !== 'GRAY') throw new Error('threshold expects a grayscale image')
  const out = new Uint8ClampedArray(img.data.length)
  for (let i = 0; i < img.data.length; i++) out[i] = img.data[i]! >= t ? 255 : 0
  return new Image({ width: img.width, height: img.height, colorOrder: 'GRAY', data: out })
}
