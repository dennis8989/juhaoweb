import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

document.documentElement.style.setProperty(
  '--warm-hero-pattern',
  `url(${import.meta.env.BASE_URL}patterns/warm-hero-texture.png)`,
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

