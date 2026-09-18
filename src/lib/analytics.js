import { SITE_ENV } from './amplify.js'

const GA_ID = 'G-DVY9DYTNWW'

let loaded = false

/**
 * Google Analytics only reports from the production branch, so dev and local builds stay out of the numbers.
 * Call with `false` for signed-in admins and admin pages; gtag.js picks up route changes on its own
 * through its browser-history tracking.
 */
export function setAnalyticsEnabled(enabled) {
  if (SITE_ENV !== 'amplify') return
  // gtag.js checks this flag before every hit, so it also stops tracking once someone signs in mid-visit.
  window[`ga-disable-${GA_ID}`] = !enabled
  if (!enabled || loaded) return
  loaded = true

  window.dataLayer = window.dataLayer || []
  // gtag.js reads the `arguments` object itself, so this can't be an arrow function with rest params.
  function gtag() {
    window.dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', GA_ID)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}
