import React from 'react'
import { createRoot } from 'react-dom/client'
import '@neurova/ui/styles.css'
import './styles.css'
import { App } from './App'

const host = document.getElementById('app')
if (!host) throw new Error('#app not found')
createRoot(host).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
