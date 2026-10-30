// created by AI
const { test } = require('@playwright/test')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page @P1', () => {
  test('HP-002 Legacy /home URL redirects to the home page', async ({ page }) => {
    const homePage = await new HomePage(page).goto('/home')
    await homePage.verifyPageLoaded()
  })
})
