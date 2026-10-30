// created by AI
const { test, expect } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

const storeLinks = [
  { name: 'App Store', url: /apps\.apple\.com\/us\/app\/complya\/id6760423936/, open: (homePage) => homePage.clickAppStore() },
  { name: 'Google Play', url: /play\.google\.com\/store\/apps\/details\?id=com\.complya/, open: (homePage) => homePage.clickGooglePlay() },
]

test.describe('Home Page @P1', () => {
  for (const store of storeLinks) {
    test(`HP-009 Footer ${store.name} link opens the store in a new tab`, async ({ page }) => {
      const homePage = await new HomePage(page).goto()
      const storeTab = await store.open(homePage)
      await expect(storeTab).toHaveURL(store.url)
      await homePage.verifyPageLoaded()
    })
  }
})
