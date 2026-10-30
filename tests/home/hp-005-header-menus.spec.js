// created by AI
const { test } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

// One link per menu; the footer test covers every destination
const menuLinks = [
  { menu: 'Product', link: /^02 Clinical/ },
  { menu: 'Solutions', link: /^Owners/ },
  { menu: 'Company', link: 'Contact' },
]

test.describe('Home Page @P1', () => {
  for (const { menu, link } of menuLinks) {
    test(`HP-005 "${menu}" menu link opens the correct page`, async ({ page }) => {
      const homePage = await new HomePage(page).goto()
      const destination = await homePage.clickMenuLink(menu, link)
      await destination.verifyPageLoaded()
    })
  }
})
