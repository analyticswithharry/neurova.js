import { useSignal } from '@neurova/runtime'

export function App() {
  const [count, setCount] = useSignal(0)
  return (
    <main style={{ fontFamily: 'system-ui', padding: '40px', textAlign: 'center' }}>
      <h1>{{ name }}</h1>
      <p>Built with neurova.js — React 19 + TypeScript + Vite.</p>
      <button type="button" onClick={() => setCount((n) => n + 1)}>
        Clicked {count} times
      </button>
    </main>
  )
}
