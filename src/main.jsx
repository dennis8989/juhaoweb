import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { configureAmplify } from './lib/amplify.js'
import { revealWhenFontsReady } from './lib/fontGate.js'
import App from './App.jsx'
import './index.css'

configureAmplify()

document.documentElement.style.setProperty(
  '--warm-hero-pattern',
  `url(${import.meta.env.BASE_URL}patterns/warm-hero-texture.png)`,
)

function FontGate() {
  useEffect(() => {
    revealWhenFontsReady()
  }, [])
  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <FontGate />
  </React.StrictMode>,
)

