// created by AI
const { test } = require('../../lambdatest-setup')
const { HomePage } = require('../../pages/homepage')

test.describe('Home Page @P0', () => {
  test('HP-001 Home page loads at the root URL', async ({ page }) => {
    const homePage = await new HomePage(page).goto()
    await homePage.verifyPageLoaded()
  })
})
