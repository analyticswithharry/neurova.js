# AI Stack: `@neurova/ai`, `@neurova/ai-core`, `@neurova/ai-ml`, `@neurova/ai-vision`, `@neurova/ai-data`

## `@neurova/ai`

High-level AI product APIs:

- chat
- embeddings
- vector store
- RAG
- agents/tools
- tracing
- provider adapters (`openai`, `anthropic`, `ollama`, `echo`)

```ts
import { chat, providers } from '@neurova/ai'
const provider = providers.echo()
const result = await chat(provider, { messages: [{ role: 'user', content: 'hello' }] })
```

## `@neurova/ai-core`

Low-level tensor + autograd + neural net building blocks with zero dependencies.

Use this for custom ML research/educational models directly in TypeScript.

## `@neurova/ai-ml`

Classical ML learners with a Python-like API style:

- `KNearestNeighbors`
- `LogisticLearner`
- `LinearRegression`
- `KMeans`

Core flow:
- `.train(X, y)`
- `.infer(X)`

## `@neurova/ai-vision`

Image processing primitives with **BGR default** channel order.

Includes:
- color conversion
- blur/threshold filters
- transforms/resize/flip
- Node/browser IO adapters

## `@neurova/ai-data`

Datasets + CSV parsing utilities.

Includes:
- Iris loader
- Fashion-MNIST loader
- CSV parser + matrix helpers

## How to combine all AI packages

- Use `ai-data` for datasets
- Train/validate baseline models with `ai-ml`
- Build custom tensor models with `ai-core`
- Process images with `ai-vision`
- Expose user-facing AI features with `ai`
