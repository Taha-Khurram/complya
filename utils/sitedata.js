// created by AI

// Sites can't be deleted, and a saved NPI + EIN count as "already used" afterwards,
// so each call returns a new site name, NPI and EIN.

// NPI check digit: Luhn over "80840" + the first 9 digits
const npiCheckDigit = (base) => {
  const digits = `80840${base}`.split('').map(Number)
  let sum = 0
  for (let i = digits.length - 1, double = true; i >= 0; i--, double = !double) {
    let digit = digits[i]
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return (10 - (sum % 10)) % 10
}

const randomDigits = (length) => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')

const newNpi = () => {
  const base = `1${randomDigits(8)}`
  return `${base}${npiCheckDigit(base)}`
}

// XX-XXXXXXX, with a prefix from 10 to 98
const newEin = () => `${10 + Math.floor(Math.random() * 89)}-${randomDigits(7)}`

// Keyed by the New Site field labels (NewSiteDialog.FIELDS)
const newSiteData = (prefix = 'QA Site') => ({
  'Site Name': `${prefix} ${Date.now()}`,
  'NPI': newNpi(),
  'EIN': newEin(),
  'Phone No': '(512) 555-0100',
  'Billing Email': 'billing.qa@example.com',
  'Address': '100 Congress Ave',
  'City': 'Austin',
  'ZIP Code': '78701',
  'State': 'TX',
})

// Already used by other sites, so a site saved with them fails verification
const DUPLICATE_NPI = '1234567893'
const DUPLICATE_EIN = '12-3456789'

module.exports = { newSiteData, DUPLICATE_NPI, DUPLICATE_EIN }
