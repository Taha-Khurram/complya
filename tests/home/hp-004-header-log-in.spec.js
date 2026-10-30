// created by AI
const { test } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page @P0', () => {
  test('HP-004 Header "Log in" link opens the app sign-in page', async ({ page }) => {
    const homePage = await new HomePage(page).goto()
    const loginPage = await homePage.clickLogIn()
    await loginPage.verifyPageLoaded()
  })
})
