// created by AI
const { test } = require('../../lambdatest-setup')
const { expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

const destinations = [
  { name: 'Book a demo', path: /\/home\/requestdemo/, open: (homePage) => homePage.clickNavBookDemo() },
  { name: 'Download App', path: /\/home\/download/, open: (homePage) => homePage.clickDownloadApp() },
  { name: 'Support', path: /\/home\/contact/, open: (homePage) => homePage.clickSupport() },
  { name: 'MSA', path: /\/home\/msa/, open: (homePage) => homePage.clickMsa() },
  { name: 'BAA', path: /\/home\/baa/, open: (homePage) => homePage.clickBaa() },
  { name: 'Privacy', path: /\/home\/privacy/, open: (homePage) => homePage.clickPrivacy() },
  { name: 'Terms of Service', path: /\/home\/terms/, open: (homePage) => homePage.clickTerms() },
  { name: 'Document', path: /\/home\/docs/, open: (homePage) => homePage.clickDocument() },
]

test.describe('Home Page', () => {
  for (const destination of destinations) {
    test(`HP-015 ${destination.name} page loads without error @P1`, async ({ page }) => {
      const homePage = new HomePage(page)
      await homePage.goto()
      await homePage.verifyPageLoaded()
      await destination.open(homePage)
      await expect(page).toHaveURL(destination.path)
      await expect(page.locator('body')).not.toContainText('404')
      await expect(page.locator('body')).not.toContainText('Page not found')
    })
  }
})
