// created by AI
const { test } = require('../../lambdatest-setup')
const { HomePage } = require('../../pages/homepage')

const headerLinks = [
  { name: 'Complya home', open: (homePage) => homePage.clickHeaderLogo() },
  { name: 'AI', open: (homePage) => homePage.clickHeaderLink('AI') },
  { name: 'Pricing', open: (homePage) => homePage.clickHeaderLink('Pricing') },
  { name: 'Book a demo', open: (homePage) => homePage.clickHeaderBookDemo() },
]

test.describe('Home Page @P0', () => {
  for (const link of headerLinks) {
    test(`HP-003 Header "${link.name}" link opens the correct page`, async ({ page }) => {
      const homePage = await new HomePage(page).goto()
      const destination = await link.open(homePage)
      await destination.verifyPageLoaded()
    })
  }
})
