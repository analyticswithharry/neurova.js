/**
 * Node image I/O via the optional `sharp` peer dependency. If `sharp` is not
 * installed this module throws a clear error at call time (kept dynamic so
 * the rest of the package remains zero-dependency).
 */
import { Image } from './image'

export interface ReadImageOptions {
  colorOrder?: 'BGR' | 'RGB' | 'BGRA' | 'RGBA' | 'GRAY'
}

let sharpMod: any = null
async function loadSharp(): Promise<any> {
  if (sharpMod) return sharpMod
  try {
    sharpMod = (await import('sharp')).default
    return sharpMod
  } catch {
    throw new Error(
      "@neurova/ai-vision/io-node requires the optional 'sharp' peer dependency. Install with: pnpm add sharp",
    )
  }
}

export async function readImage(
  source: string | Buffer | Uint8Array,
  opts: ReadImageOptions = {},
): Promise<Image> {
  const sharp = await loadSharp()
  const order = opts.colorOrder ?? 'BGR'
  const pipeline = sharp(source as any)
  const wantAlpha = order === 'RGBA' || order === 'BGRA'
  const wantGray = order === 'GRAY'
  const channels = wantGray ? 1 : wantAlpha ? 4 : 3
  const buf = wantGray
    ? await pipeline.greyscale().raw().toBuffer({ resolveWithObject: true })
    : await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  const { data, info } = buf as { data: Buffer; info: { width: number; height: number } }
  const w = info.width, h = info.height

  if (wantGray) {
    return new Image({ width: w, height: h, colorOrder: 'GRAY', data: new Uint8ClampedArray(data) })
  }
  // sharp gives RGBA. Drop alpha or swap as needed.
  if (order === 'RGBA') {
    return new Image({ width: w, height: h, colorOrder: 'RGBA', data: new Uint8ClampedArray(data) })
  }
  if (order === 'BGRA') {
    const out = new Uint8ClampedArray(data)
    for (let i = 0; i < out.length; i += 4) { const t = out[i]!; out[i] = out[i + 2]!; out[i + 2] = t }
    return new Image({ width: w, height: h, colorOrder: 'BGRA', data: out })
  }
  const out = new Uint8ClampedArray(w * h * 3)
  if (order === 'BGR') {
    for (let i = 0, p = 0; p < data.length; i += 3, p += 4) {
      out[i] = data[p + 2]!; out[i + 1] = data[p + 1]!; out[i + 2] = data[p]!
    }
  } else {
    for (let i = 0, p = 0; p < data.length; i += 3, p += 4) {
      out[i] = data[p]!; out[i + 1] = data[p + 1]!; out[i + 2] = data[p + 2]!
    }
  }
  void channels
  return new Image({ width: w, height: h, colorOrder: order, data: out })
}
