import Link from 'next/link'

const examples = [
  {
    slug: 'chatbot',
    title: 'Chatbot',
    desc: 'Streaming chat server using @neurova/ai + @neurova/backend.',
  },
  {
    slug: 'dashboard',
    title: 'Dashboard',
    desc: 'React dashboard with @neurova/ui components and theming.',
  },
  {
    slug: 'rag-search',
    title: 'RAG search',
    desc: 'In-memory vector store + retrieve + answer pipeline.',
  },
  {
    slug: 'recommendation-engine',
    title: 'Recommendation engine',
    desc: 'Cosine-similarity content recommendations.',
  },
]

export default function Page() {
  return (
    <article>
      <h1>Examples</h1>
      <p>
        Live, runnable examples in the <code>examples/</code> directory of the repo.
      </p>
      <div className="nv-grid">
        {examples.map((e) => (
          <div key={e.slug} className="nv-card">
            <h3>{e.title}</h3>
            <p>{e.desc}</p>
            <Link
              href={`https://github.com/analyticswithharry/neurova.js/tree/main/examples/${e.slug}`}
            >
              View source →
            </Link>
          </div>
        ))}
      </div>
    </article>
  )
}
