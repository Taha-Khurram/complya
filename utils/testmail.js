require('dotenv').config()

// testmail.app JSON API: https://testmail.app/docs/
const API_URL = 'https://api.testmail.app/api/json'

const config = () => {
  const { TESTMAIL_API_KEY: apikey, TESTMAIL_NAMESPACE: namespace } = process.env
  if (!apikey || !namespace) {
    throw new Error('TESTMAIL_API_KEY and TESTMAIL_NAMESPACE must be set in .env')
  }
  return { apikey, namespace }
}

// Unique address for one test, e.g. <namespace>.qa.1730300000000x7k2@inbox.testmail.app
const generateEmailAddress = (prefix = 'qa') =>
  `${config().namespace}.${prefix}.${Date.now()}${Math.random().toString(36).slice(2, 6)}@inbox.testmail.app`

// "<namespace>.<tag>@inbox.testmail.app" -> "<tag>"
const tagOf = (address) => address.split('@')[0].slice(config().namespace.length + 1)

// Waits for the newest email to `address`, or throws after `timeout` ms. Pass `receivedAfter`
// as the time just before the action that sends it, so older emails to a reused address don't match
const waitForEmail = async (address, { receivedAfter, timeout = 60000 } = {}) => {
  const { apikey, namespace } = config()
  const params = new URLSearchParams({ apikey, namespace, tag: tagOf(address), livequery: 'true' })
  if (receivedAfter) params.set('timestamp_from', String(receivedAfter.getTime()))

  // Live queries redirect to themselves every minute, so the abort signal is what limits the wait
  let res
  try {
    res = await fetch(`${API_URL}?${params}`, { signal: AbortSignal.timeout(timeout) })
  } catch (error) {
    if (error.name === 'TimeoutError') throw new Error(`No email to ${address} within ${timeout} ms`)
    throw error
  }
  // The URL holds the API key, so errors only show the status and message
  const body = await res.json()
  if (!res.ok || body.result !== 'success') {
    throw new Error(`testmail.app query failed (${res.status}): ${body.message}`)
  }
  return body.emails.sort((a, b) => b.timestamp - a.timestamp)[0]
}

// Link URLs from the HTML body, or from the text body for plain-text emails
const getLinks = (email) => {
  const hrefs = [...(email.html ?? '').matchAll(/href="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&'))
  return hrefs.length ? hrefs : (email.text ?? '').match(/https?:\/\/\S+/g) ?? []
}

// First match of `pattern` in the text body, e.g. a 6-digit OTP
const getCode = (email, pattern = /\b\d{6}\b/) => (email.text ?? '').match(pattern)?.[0]

module.exports = { generateEmailAddress, waitForEmail, getLinks, getCode }
