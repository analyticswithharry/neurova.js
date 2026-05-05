/**
 * Browser image I/O. Reads via fetch + createImageBitmap, draws to OffscreenCanvas
 * to extract RGBA pixel data, then reorders to BGR by default to match OpenCV-style
 * conventions used by `neurova` Python.
 */
import { Image } from './image'

export interface ReadImageOptions {
  /** Target color order. Default 'BGR'. */
  colorOrder?: 'BGR' | 'RGB' | 'BGRA' | 'RGBA' | 'GRAY'
}

/** Read an image from a URL, Blob, or HTMLImageElement-compatible source. */
export async function readImage(
  source: string | Blob | ImageBitmapSource,
  opts: ReadImageOptions = {},
): Promise<Image> {
  const order = opts.colorOrder ?? 'BGR'
  const bitmap = typeof source === 'string'
    ? await createImageBitmap(await (await fetch(source)).blob())
    : (source as Blob | ImageBitmapSource) instanceof Blob
      ? await createImageBitmap(source as Blob)
      : await createImageBitmap(source as ImageBitmapSource)

  const w = bitmap.width, h = bitmap.height
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : Object.assign(document.createElement('canvas'), { width: w, height: h })
  const ctx = (canvas as OffscreenCanvas).getContext('2d') as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null
  if (!ctx) throw new Error('2d context unavailable')
  ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0)
  const rgba = ctx.getImageData(0, 0, w, h).data  // RGBA, row-major

  if (order === 'RGBA') {
    return new Image({ width: w, height: h, colorOrder: 'RGBA', data: new Uint8ClampedArray(rgba) })
  }
  if (order === 'BGRA') {
    const out = new Uint8ClampedArray(rgba)
    for (let i = 0; i < out.length; i += 4) { const t = out[i]!; out[i] = out[i + 2]!; out[i + 2] = t }
    return new Image({ width: w, height: h, colorOrder: 'BGRA', data: out })
  }
  if (order === 'GRAY') {
    const out = new Uint8ClampedArray(w * h)
    for (let i = 0, p = 0; i < out.length; i++, p += 4) {
      out[i] = Math.round(0.299 * rgba[p]! + 0.587 * rgba[p + 1]! + 0.114 * rgba[p + 2]!)
    }
    return new Image({ width: w, height: h, colorOrder: 'GRAY', data: out })
  }
  // Drop alpha, optionally swap to BGR.
  const out = new Uint8ClampedArray(w * h * 3)
  if (order === 'BGR') {
    for (let i = 0, p = 0; p < rgba.length; i += 3, p += 4) {
      out[i] = rgba[p + 2]!; out[i + 1] = rgba[p + 1]!; out[i + 2] = rgba[p]!
    }
  } else {
    for (let i = 0, p = 0; p < rgba.length; i += 3, p += 4) {
      out[i] = rgba[p]!; out[i + 1] = rgba[p + 1]!; out[i + 2] = rgba[p + 2]!
    }
  }
  return new Image({ width: w, height: h, colorOrder: order, data: out })
}
