// created by AI
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')

test.use({ baseURL: process.env.APP_URL || 'https://app.complya.dev' })

test.describe('Login', () => {
  test.skip(!process.env.USER_EMAIL || !process.env.USER_PASSWORD, 'USER_EMAIL and USER_PASSWORD are not set')

  test('LG-001 Successful login with a valid email and password @login @smoke @positive', async ({ page }) => {
    const loginPage = await new LoginPage(page).goto()
    const dashboardPage = await loginPage.login(process.env.USER_EMAIL, process.env.USER_PASSWORD)
    await expect(page).toHaveURL(/\/app\/$/, { timeout: 30000 })
    await expect(dashboardPage.homeHeading).toBeVisible()
  })
})
