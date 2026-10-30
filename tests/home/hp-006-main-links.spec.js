// created by AI
const { test } = require('../../lambdatest-setup')
const { HomePage } = require('../../pages/homepage')

const mainLinks = [
  { name: 'New Meet Complya AI agents', open: (homePage) => homePage.clickMainLink('New Meet Complya AI agents') },
  { name: 'Hero Book a demo', open: (homePage) => homePage.clickHeroBookDemo() },
  { name: 'Explore the platform', open: (homePage) => homePage.clickMainLink('Explore the platform') },
  { name: 'See Complya for RBTs', open: (homePage) => homePage.clickMainLink('See Complya for RBTs') },
  { name: 'Read our story', open: (homePage) => homePage.clickMainLink('Read our story') },
  { name: 'Explore Complya AI', open: (homePage) => homePage.clickMainLink('Explore Complya AI') },
  { name: 'See it on your data', open: (homePage) => homePage.clickMainLink('See it on your data') },
  { name: 'Security, HIPAA and our BAA', open: (homePage) => homePage.clickMainLink('Security, HIPAA and our BAA') },
  { name: 'See pricing details', open: (homePage) => homePage.clickMainLink('See pricing details') },
  { name: 'Closing Book a demo', open: (homePage) => homePage.clickClosingBookDemo() },
  { name: 'See pricing', open: (homePage) => homePage.clickMainLink('See pricing') },
]

test.describe('Home Page @P1', () => {
  for (const link of mainLinks) {
    test(`HP-006 "${link.name}" link opens the correct page`, async ({ page }) => {
      const homePage = await new HomePage(page).goto()
      const destination = await link.open(homePage)
      await destination.verifyPageLoaded()
    })
  }
})
