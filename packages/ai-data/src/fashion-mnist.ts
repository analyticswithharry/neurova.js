/**
 * Fashion-MNIST loader — fetches IDX-format files from Zalando's CDN.
 * Browser: uses `fetch`. Node: also uses `fetch` (Node 18+). Caching is left
 * to the host runtime (HTTP cache or service worker).
 */
import type { Dataset } from './types'

const BASE = 'https://storage.googleapis.com/tensorflow/tf-keras-datasets/'

interface FashionMnistOptions {
  /** Override base URL (e.g. for local mirror). */
  baseUrl?: string
  /** Subset: 'train' (60k) or 'test' (10k). Default 'train'. */
  subset?: 'train' | 'test'
}

const LABELS = [
  'T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
  'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot',
]

/**
 * Load Fashion-MNIST. Each sample is a flattened 28×28 grayscale image
 * (784 features) with values in [0, 1]. Targets are integers 0–9.
 *
 * Note: this hits the network on first call. Cache responses for offline use.
 */
export async function loadFashionMnist(opts: FashionMnistOptions = {}): Promise<Dataset> {
  const base = opts.baseUrl ?? BASE
  const subset = opts.subset ?? 'train'
  const isTrain = subset === 'train'
  const imgFile = isTrain ? 'train-images-idx3-ubyte.gz' : 't10k-images-idx3-ubyte.gz'
  const lblFile = isTrain ? 'train-labels-idx1-ubyte.gz' : 't10k-labels-idx1-ubyte.gz'
  const [imgBuf, lblBuf] = await Promise.all([
    fetchAndDecompress(base + imgFile),
    fetchAndDecompress(base + lblFile),
  ])
  const { images, count, rows, cols } = parseIdxImages(imgBuf)
  const labels = parseIdxLabels(lblBuf)
  if (labels.length !== count) throw new Error('Fashion-MNIST image/label count mismatch')

  const data = new Float32Array(count * rows * cols)
  for (let i = 0; i < data.length; i++) data[i] = images[i]! / 255
  const target = new Float32Array(count)
  for (let i = 0; i < count; i++) target[i] = labels[i]!

  return {
    data, target,
    nSamples: count, nFeatures: rows * cols,
    featureNames: Array.from({ length: rows * cols }, (_, i) => `pixel${i}`),
    targetNames: LABELS,
    description: `Fashion-MNIST ${subset} subset (${count} × 28×28 grayscale).`,
  }
}

async function fetchAndDecompress(url: string): Promise<Uint8Array> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`)
  // DecompressionStream is supported in browsers and Node 18+.
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream API unavailable; need Node ≥ 18 or modern browser')
  }
  const stream = res.body!.pipeThrough(new DecompressionStream('gzip'))
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    chunks.push(value); total += value.length
  }
  const out = new Uint8Array(total)
  let off = 0
  for (const c of chunks) { out.set(c, off); off += c.length }
  return out
}

function parseIdxImages(buf: Uint8Array): { images: Uint8Array; count: number; rows: number; cols: number } {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const magic = view.getUint32(0, false)
  if (magic !== 0x00000803) throw new Error(`bad IDX images magic: ${magic.toString(16)}`)
  const count = view.getUint32(4, false)
  const rows = view.getUint32(8, false)
  const cols = view.getUint32(12, false)
  const images = buf.subarray(16, 16 + count * rows * cols)
  return { images, count, rows, cols }
}

function parseIdxLabels(buf: Uint8Array): Uint8Array {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const magic = view.getUint32(0, false)
  if (magic !== 0x00000801) throw new Error(`bad IDX labels magic: ${magic.toString(16)}`)
  const count = view.getUint32(4, false)
  return buf.subarray(8, 8 + count)
}
