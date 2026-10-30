// created by AI
const { test } = require('../../lambdatest-setup')
const { HomePage } = require('../../pages/homepage')

const cards = [
  '/product/ai',
  '/product/clinical',
  '/product/compliance',
  '/product/revenue',
  '/product/operations',
  '/product/insights',
]

test.describe('Home Page @P1', () => {
  for (const path of cards) {
    test(`HP-007 Platform card opens ${path}`, async ({ page }) => {
      const homePage = await new HomePage(page).goto()
      const productPage = await homePage.clickPlatformCard(path)
      await productPage.verifyPageLoaded()
    })
  }
})
