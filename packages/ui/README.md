# @neurova/ui

React 19 component library — accessible, themeable, SSR-safe.

```tsx
import '@neurova/themes/light.css'
import '@neurova/ui/styles.css'
import { Button, ChatWindow, ThemeProvider } from '@neurova/ui'

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Button variant="primary">Hello neurova</Button>
    </ThemeProvider>
  )
}
```
