import { Amplify } from 'aws-amplify'
import outputs from 'virtual:amplify-outputs'

/** Amplify branch that built this bundle (set in amplify.yml); dev and local builds count as `dev`. */
export const SITE_ENV = import.meta.env.VITE_SITE_ENV === 'amplify' ? 'amplify' : 'dev'

export function isAmplifyConfigured() {
  return Boolean(outputs?.data?.url && outputs?.data?.api_key)
}

export function configureAmplify() {
  if (!isAmplifyConfigured()) return
  Amplify.configure(outputs)
}
