// created by AI
const { test } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

const footerLinks = [
  // Product
  'Platform', 'AI', 'Clinical', 'Compliance', 'Revenue', 'Operations', 'Insights', 'Pricing',
  // Solutions
  'Owners', 'Clinicians', 'Therapists', 'Billing',
  // Company
  'About', 'Security', 'Contact', 'Support', 'Download', 'Docs',
  // Legal
  'Master Service Agreement', 'Business Associate Agreement', 'Terms of Service', 'Privacy Policy',
  'Subprocessors', 'Cookie Policy', 'All legal documents',
]

test.describe('Home Page @P1', () => {
  test('HP-008 Footer "Complya home" logo returns to the home page', async ({ page }) => {
    const homePage = await new HomePage(page).goto()
    const destination = await homePage.clickFooterLogo()
    await destination.verifyPageLoaded()
  })

  for (const name of footerLinks) {
    test(`HP-008 Footer "${name}" link opens the correct page`, async ({ page }) => {
      const homePage = await new HomePage(page).goto()
      const destination = await homePage.clickFooterLink(name)
      await destination.verifyPageLoaded()
    })
  }
})
