// created by AI
const { BasePage } = require('./basepage')

class DownloadPage extends BasePage {
    constructor(page) {
        super(page)

        this.path = '/download'
        this.title = 'Download the App for iPhone & Android | Complya'
        this.heading = page.getByRole('heading', { level: 1, name: 'Complya for iPhone and Android.', exact: true })
    }
}

module.exports = { DownloadPage }
