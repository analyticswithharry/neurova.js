/**
 * Color-space conversions. Port of `neurova.core.color`. Default is BGR.
 */
import { Image } from './image'

/** Convert any 3- or 4-channel image to single-channel grayscale (BT.601). */
export function toGrayscale(img: Image): Image {
  if (img.colorOrder === 'GRAY') return img.clone()
  const out = new Uint8ClampedArray(img.width * img.height)
  const c = img.channels
  const isRgb = img.colorOrder === 'RGB' || img.colorOrder === 'RGBA'
  for (let i = 0, p = 0; i < out.length; i++, p += c) {
    const a = img.data[p]!, b = img.data[p + 1]!, d = img.data[p + 2]!
    const r = isRgb ? a : d
    const g = b
    const bl = isRgb ? d : a
    out[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * bl)
  }
  return new Image({ width: img.width, height: img.height, colorOrder: 'GRAY', data: out })
}

/** Swap channel order between BGR and RGB (3 or 4 channel). */
export function swapChannels(img: Image): Image {
  if (img.channels < 3) return img.clone()
  const out = new Uint8ClampedArray(img.data)
  for (let i = 0; i < out.length; i += img.channels) {
    const t = out[i]!; out[i] = out[i + 2]!; out[i + 2] = t
  }
  let newOrder = img.colorOrder
  if (img.colorOrder === 'BGR') newOrder = 'RGB'
  else if (img.colorOrder === 'RGB') newOrder = 'BGR'
  else if (img.colorOrder === 'BGRA') newOrder = 'RGBA'
  else if (img.colorOrder === 'RGBA') newOrder = 'BGRA'
  return new Image({ width: img.width, height: img.height, channels: img.channels, colorOrder: newOrder, data: out })
}
