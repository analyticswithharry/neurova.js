# @neurova/ai-vision

Image class + color/filter/transform routines. JS/TS port of subset of the
[Python `neurova`](https://pypi.org/project/neurova/) library. **Default color
order is BGR** to match the Python original.

## Browser
```ts
import { readImage } from '@neurova/ai-vision/io-browser'
import { gaussianBlur, toGrayscale } from '@neurova/ai-vision'

const img = await readImage('/photo.jpg')         // BGR by default
const gray = toGrayscale(gaussianBlur(img, 1.5))
```

## Node (requires optional `sharp` peer dep)
```ts
import { readImage } from '@neurova/ai-vision/io-node'
const img = await readImage('./photo.jpg')
```

Currently shipped: `Image`, `toGrayscale`, `swapChannels`, `boxBlur`,
`gaussianBlur`, `threshold`, `resize`, `flipHorizontal`, `flipVertical`,
plus dual `io-browser` / `io-node` adapters.

© @analyticswithharry and Squid Consultancy Group Ltd. MIT.
