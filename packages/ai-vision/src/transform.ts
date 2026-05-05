/**
 * Geometric transforms. Port of subset of `neurova.transform`.
 */
import { Image } from './image'

/** Nearest-neighbor resize. */
export function resize(img: Image, newWidth: number, newHeight: number): Image {
  const out = new Uint8ClampedArray(newWidth * newHeight * img.channels)
  const w = img.width
  const h = img.height
  const c = img.channels
  for (let y = 0; y < newHeight; y++) {
    const sy = Math.floor((y / newHeight) * h)
    for (let x = 0; x < newWidth; x++) {
      const sx = Math.floor((x / newWidth) * w)
      const srcOff = (sy * w + sx) * c
      const dstOff = (y * newWidth + x) * c
      for (let ch = 0; ch < c; ch++) out[dstOff + ch] = img.data[srcOff + ch]!
    }
  }
  return new Image({
    width: newWidth,
    height: newHeight,
    channels: c,
    colorOrder: img.colorOrder,
    data: out,
  })
}

export function flipHorizontal(img: Image): Image {
  const w = img.width
  const h = img.height
  const c = img.channels
  const out = new Uint8ClampedArray(img.data.length)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcOff = (y * w + x) * c
      const dstOff = (y * w + (w - 1 - x)) * c
      for (let ch = 0; ch < c; ch++) out[dstOff + ch] = img.data[srcOff + ch]!
    }
  }
  return new Image({ width: w, height: h, channels: c, colorOrder: img.colorOrder, data: out })
}

export function flipVertical(img: Image): Image {
  const w = img.width
  const h = img.height
  const c = img.channels
  const out = new Uint8ClampedArray(img.data.length)
  for (let y = 0; y < h; y++) {
    const srcRow = y * w * c
    const dstRow = (h - 1 - y) * w * c
    out.set(img.data.subarray(srcRow, srcRow + w * c), dstRow)
  }
  return new Image({ width: w, height: h, channels: c, colorOrder: img.colorOrder, data: out })
}
