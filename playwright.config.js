require('dotenv').config()
const os = require('node:os')

module.exports = {
  testDir: 'tests',
  testMatch: '**/*.spec.js',
  timeout: 300000,
  workers: 3, // keep ≤ your LambdaTest parallel session limit
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      environmentInfo: {
        os_platform: os.platform(),
        node_version: process.version,
      },
    }],
  ],
  use: {
    baseURL: 'https://complya.dev',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    // LambdaTest paused. Uncomment these to re-enable.
    // {
    //   name: 'chrome:latest:Windows 11@lambdatest',
    //   use: { viewport: { width: 1280, height: 720 } }
    // },
    // {
    //   name: 'pw-webkit:latest:MacOS Sonoma@lambdatest',
    //   use: { viewport: { width: 1920, height: 1080 } }
    // },
    // {
    //   name: 'pw-firefox:latest:Windows 10@lambdatest',
    //   use: { viewport: { width: 1280, height: 720 } }
    // },
    {
      name: 'chromium-local',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } }
    },
  ]
}
