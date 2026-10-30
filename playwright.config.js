require('dotenv').config()
const os = require('node:os')

module.exports = {
  testDir: 'tests',
  testMatch: '**/*.spec.js',
  timeout: 300000,
  workers: 3,
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
    {
      name: 'chromium-local',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } }
    },
  ]
}
