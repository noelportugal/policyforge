import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { registerBuiltInFields } from './fields'
import { registerBuiltInLogos } from './components/Logos'
import { registerBuiltInExtensions } from './plugins'
import './rating/engine'
import './styles/app.css'

// Registration happens once, before the first render. A client-specific build
// adds its own registrations here and ships no other code change.
registerBuiltInFields()
registerBuiltInLogos()
registerBuiltInExtensions()

const container = document.getElementById('root')
if (!container) throw new Error('No #root element in the page')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
