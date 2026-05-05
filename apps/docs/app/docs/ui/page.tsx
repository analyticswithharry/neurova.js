export default function Page() {
  return (
    <article>
      <h1>@neurova/ui</h1>
      <p>Production-ready React components, themed via <code>@neurova/themes</code>.</p>

      <h2>Setup</h2>
      <pre>{`import '@neurova/themes/light.css'
import '@neurova/themes/dark.css'  // optional
import '@neurova/ui/styles.css'

import { ThemeProvider, Button } from '@neurova/ui'

<ThemeProvider defaultTheme="light">
  <Button variant="primary">Click me</Button>
</ThemeProvider>`}</pre>

      <h2>Components</h2>
      <ul>
        <li><code>Button</code>, <code>Input</code>, <code>Card</code>, <code>Modal</code>, <code>Spinner</code>, <code>CodeBlock</code></li>
        <li><code>Form</code> — schema-driven (zod) with validation</li>
        <li><code>ChatWindow</code> — with message bubbles, send box, pending indicator</li>
        <li><code>ModelOutput</code>, <code>StreamRenderer</code> — render streaming AI output</li>
      </ul>

      <h2>Hooks</h2>
      <pre>{`import { useDebounce, useMediaQuery, useStream } from '@neurova/ui/hooks'`}</pre>

      <h2>Streaming chat</h2>
      <pre>{`import { ChatWindow, StreamRenderer } from '@neurova/ui'

<StreamRenderer source={chatStream(provider, { messages })} />`}</pre>
    </article>
  )
}
