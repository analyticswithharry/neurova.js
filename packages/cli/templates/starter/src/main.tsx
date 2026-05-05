import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const host = document.getElementById('root')
if (!host) throw new Error('#root not found')
createRoot(host).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
