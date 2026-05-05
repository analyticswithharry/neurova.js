import { createMemoryVectorStore } from '@neurova/ai'
import { echo } from '@neurova/ai/providers'

interface Item {
  id: string
  title: string
  description: string
  tags: string[]
}

const items: Item[] = [
  {
    id: 'p1',
    title: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones',
    tags: ['audio', 'travel'],
  },
  {
    id: 'p2',
    title: 'Mechanical Keyboard',
    description: 'Tactile switches, hot-swappable',
    tags: ['workstation', 'developer'],
  },
  {
    id: 'p3',
    title: 'Standing Desk',
    description: 'Electric height-adjustable desk',
    tags: ['workstation', 'ergonomic'],
  },
  {
    id: 'p4',
    title: 'Yoga Mat',
    description: 'Eco-friendly cork yoga mat',
    tags: ['fitness', 'wellness'],
  },
]

const provider = echo()
const store = createMemoryVectorStore<{ item: Item }>()

const { vectors } = await provider.embed({
  input: items.map((i) => `${i.title}. ${i.description}. tags: ${i.tags.join(', ')}`),
})
await store.upsert(
  items.map((item, idx) => ({ id: item.id, vector: vectors[idx]!, metadata: { item } })),
)

async function recommend(query: string, topK = 3) {
  const { vectors: qv } = await provider.embed({ input: query })
  const matches = await store.query({ vector: qv[0]!, topK })
  return matches.map((m) => ({ score: m.score.toFixed(3), item: m.metadata?.item.title }))
}

console.log('Query: "comfortable workspace gear"')
console.log(await recommend('comfortable workspace gear'))
console.log('\nQuery: "things for travel"')
console.log(await recommend('things for travel'))
