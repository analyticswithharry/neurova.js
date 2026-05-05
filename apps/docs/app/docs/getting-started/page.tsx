export default function GettingStarted() {
  return (
    <article>
      <h1>Getting started</h1>
      <p>Scaffold a new app:</p>
      <pre>{`npm create neurova@latest my-app
cd my-app
npm install
npm run dev`}</pre>

      <h2>Or install into an existing project</h2>
      <pre>{'npm install neurova'}</pre>

      <h2>Tree-shakable subpath imports</h2>
      <pre>{`import { chat } from 'neurova/ai'
import { Button } from 'neurova/ui'
import { createServer } from 'neurova/backend'
import { id, logger } from 'neurova/core'`}</pre>

      <h2>Requirements</h2>
      <ul>
        <li>Node ≥ 20.10</li>
        <li>TypeScript ≥ 5.0 (recommended)</li>
        <li>
          React ≥ 18 (only for <code>@neurova/ui</code>)
        </li>
      </ul>
    </article>
  )
}
