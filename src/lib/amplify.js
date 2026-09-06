import { Amplify } from 'aws-amplify'
import outputs from 'virtual:amplify-outputs'

export function isAmplifyConfigured() {
  return Boolean(outputs?.data?.url && outputs?.data?.api_key)
}

export function configureAmplify() {
  if (!isAmplifyConfigured()) return
  Amplify.configure(outputs)
}
