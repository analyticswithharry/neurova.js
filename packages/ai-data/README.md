# @neurova/ai-data

Built-in datasets and CSV utilities. JS/TS port of `neurova.datasets` /
`sklearn.datasets`-style loaders.

```ts
import { loadIris, asMatrix, parseCsv } from '@neurova/ai-data'
import { KNearestNeighbors, accuracyScore, trainTestSplit } from '@neurova/ai-ml'

const iris = loadIris()
const X = asMatrix(iris)
const y = Array.from(iris.target)
const { XTrain, XTest, yTrain, yTest } = trainTestSplit(X, y, 0.2, 42)
const knn = new KNearestNeighbors(3)
knn.train(XTrain, yTrain)
console.log(accuracyScore(yTest, knn.infer(XTest)))
```

Includes:

- `loadIris()` — inlined 150 × 4 dataset, no network required.
- `loadFashionMnist({ subset: 'train' | 'test' })` — fetches gzipped IDX
  files via `fetch` + `DecompressionStream` (Node ≥ 18 / modern browsers).
- `parseCsv(text, { header, delimiter })` — RFC-4180-ish CSV parser.
- Helpers: `row`, `asMatrix`.

© @analyticswithharry and Squid Consultancy Group Ltd. MIT.
