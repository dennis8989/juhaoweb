import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { configureAmplify } from './lib/amplify.js'
import { parseHash } from './lib/hash.js'
import { preloadDoctorPhoto } from './data/aboutPage.js'
import { revealWhenFontsReady } from './lib/fontGate.js'
import App from './App.jsx'
import './index.css'

configureAmplify()

// The About page leads with the doctor's photo: fetch it now instead of after the first render, and
// reveal the page only once it has arrived (see fontGate.js for the time limit).
const doctorPhotoReady = parseHash().view === 'about' ? preloadDoctorPhoto() : null

document.documentElement.style.setProperty(
  '--warm-hero-pattern',
  `url(${import.meta.env.BASE_URL}patterns/warm-hero-texture.png)`,
)

function FontGate() {
  useEffect(() => {
    revealWhenFontsReady({ alsoWaitFor: doctorPhotoReady })
  }, [])
  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <FontGate />
  </React.StrictMode>,
)

