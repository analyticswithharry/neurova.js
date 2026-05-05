# @neurova/ai-core

Tensor + reverse-mode autograd + nn building blocks. Pure TypeScript, zero dependencies.
JS/TS port of the Tensor / `nn` surfaces of the Python `neurova` and `nalyst` libraries.

## Install
```bash
pnpm add @neurova/ai-core
```

## Quick start
```ts
import { Tensor, Sequential, Linear, ReLU, SGD, mseLoss } from '@neurova/ai-core'

const model = new Sequential(new Linear(1, 8), new ReLU(), new Linear(8, 1))
const opt = new SGD(model.parameters(), 0.05)

const X = new Tensor([0, 1, 2, 3], [4, 1])
const Y = new Tensor([1, 3, 5, 7], [4, 1])

for (let epoch = 0; epoch < 200; epoch++) {
  opt.zeroGrad()
  const loss = mseLoss(model.forward(X), Y)
  loss.backward()
  opt.step()
}
```

Part of the [neurova.js](https://github.com/analyticswithharry/neurova.js) framework.
© @analyticswithharry and Squid Consultancy Group Ltd. MIT.
