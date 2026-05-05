# @neurova/ai-ml

Classical ML learners with the **`.train()` / `.infer()`** API.
JS/TS port of the [`nalyst`](https://pypi.org/project/nalyst/) Python library.

```ts
import { LogisticLearner, trainTestSplit, accuracyScore } from '@neurova/ai-ml'

const { Xtrain, Xtest, ytrain, ytest } = trainTestSplit(X, y, { testRatio: 0.2 })
const model = new LogisticLearner({ strength: 0.5 }).train(Xtrain, ytrain)
const acc = accuracyScore(ytest, model.infer(Xtest))
```

Currently shipped: `KNearestNeighbors`, `LogisticLearner`, `LinearRegression`,
`KMeans`, `trainTestSplit`, `accuracyScore`, `meanSquaredError`,
`BaseLearner`, `duplicate`.

© @analyticswithharry and Squid Consultancy Group Ltd. MIT.
