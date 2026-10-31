// created by AI
const { test, expect } = require('@playwright/test')
const { LoginPage } = require('../../pages/loginpage')
const { ReviewTermsPage, OrganizationTermsPage } = require('../../pages/onboardingpage')
const { createVerifiedAccount } = require('../../utils/accounts')

const baseURL = process.env.APP_URL || 'https://app.complya.dev'
test.use({ baseURL, timezoneId: 'America/Chicago' })

// One new account walks the whole flow, so each test continues from the step the previous one reached
test.describe('Onboarding', () => {
  test.skip(!process.env.TESTMAIL_API_KEY || !process.env.TESTMAIL_NAMESPACE, 'TESTMAIL_API_KEY and TESTMAIL_NAMESPACE are not set')
  test.describe.configure({ mode: 'serial' })

  const companyName = `QA Onboard ${String(Date.now()).slice(-6)}`
  const workspaceDetails = { phone: '7025550123', fax: '5551234567', npi: '1234567893', ein: '123456789', billingEmail: 'billing.qa@example.com', address: '1 Test Street', city: 'Austin', zip: '73301', state: 'TX' }
  let account

  // Uses 1 testmail.app email and leaves a permanent dev account and a pending workspace
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ baseURL })
    account = await createVerifiedAccount(page, { prefix: 'onboarding' })
    await page.close()
  })

  const signIn = async (page, step) => {
    const loginPage = await new LoginPage(page).goto()
    return await loginPage.loginToOnboarding(account.email, account.password, step)
  }

  test('OB-001 New account starts onboarding at Review our terms @onboarding @smoke @positive', async ({ page }) => {
    const reviewTermsPage = await signIn(page, 'terms')
    await reviewTermsPage.verifyPageLoaded()
    await expect(reviewTermsPage.heading).toBeVisible()
    await expect(reviewTermsPage.intro).toBeVisible()

    // Five sections, only the first one open
    for (const name of ReviewTermsPage.SECTIONS) await expect(reviewTermsPage.section(name)).toBeVisible()
    await expect(reviewTermsPage.section('Terms of Service')).toHaveAttribute('aria-expanded', 'true')
    for (const name of ReviewTermsPage.SECTIONS.slice(1)) await expect(reviewTermsPage.section(name)).toHaveAttribute('aria-expanded', 'false')

    // Five unchecked consents and a disabled Continue
    await expect(reviewTermsPage.consents).toHaveCount(5)
    for (const label of ReviewTermsPage.CONSENTS) await expect(reviewTermsPage.consent(label)).not.toBeChecked()
    await expect(reviewTermsPage.continueButton).toBeDisabled()

    // Other app pages redirect back until the terms are accepted
    await reviewTermsPage.goto('/app/onboarding')
    await reviewTermsPage.verifyPageLoaded()
    await reviewTermsPage.goto('/app/')
    await reviewTermsPage.verifyPageLoaded()
  })

  test('OB-002 Terms sections open one at a time and link to the full documents @onboarding @positive', async ({ page }) => {
    const reviewTermsPage = await signIn(page, 'terms')
    await reviewTermsPage.verifyPageLoaded()

    await expect(reviewTermsPage.section('Terms of Service')).toHaveAttribute('aria-expanded', 'true')
    const termsLink = reviewTermsPage.documentLink('Terms of Service')
    await expect(termsLink).toBeVisible()
    await expect(termsLink).toHaveAttribute('href', 'https://complya.com/terms')
    await expect(termsLink).toHaveAttribute('target', '_blank')

    await reviewTermsPage.toggleSection('Privacy Policy')
    await expect(reviewTermsPage.section('Privacy Policy')).toHaveAttribute('aria-expanded', 'true')
    await expect(reviewTermsPage.section('Terms of Service')).toHaveAttribute('aria-expanded', 'false')
    await expect(termsLink).toBeHidden()
    const privacyLink = reviewTermsPage.documentLink('Privacy Policy')
    await expect(privacyLink).toBeVisible()
    await expect(privacyLink).toHaveAttribute('href', 'https://complya.com/privacy')
    await expect(privacyLink).toHaveAttribute('target', '_blank')

    // The last three sections have no full-document link
    for (const name of ['Electronic Signature Disclosure', 'AI Disclosure', 'HIPAA Acknowledgement']) {
      await reviewTermsPage.toggleSection(name)
      for (const other of ReviewTermsPage.SECTIONS) {
        await expect(reviewTermsPage.section(other)).toHaveAttribute('aria-expanded', other === name ? 'true' : 'false')
      }
      await expect(reviewTermsPage.documentLinks.filter({ visible: true })).toHaveCount(0)
    }

    // Clicking the open section closes it
    await reviewTermsPage.toggleSection('HIPAA Acknowledgement')
    for (const name of ReviewTermsPage.SECTIONS) await expect(reviewTermsPage.section(name)).toHaveAttribute('aria-expanded', 'false')
  })

  test('OB-003 All five consents are required to continue @onboarding @smoke @validation', async ({ page }) => {
    const reviewTermsPage = await signIn(page, 'terms')
    await reviewTermsPage.verifyPageLoaded()
    await expect(reviewTermsPage.continueButton).toBeDisabled()

    // Four of five is not enough
    for (const label of ReviewTermsPage.CONSENTS.slice(0, 4)) await reviewTermsPage.checkConsent(label)
    await expect(reviewTermsPage.continueButton).toBeDisabled()
    await reviewTermsPage.uncheckConsent(ReviewTermsPage.CONSENTS[0])
    await expect(reviewTermsPage.continueButton).toBeDisabled()

    // The label text toggles its checkbox
    const label = ReviewTermsPage.CONSENTS[0]
    await reviewTermsPage.clickConsentLabel(label)
    await expect(reviewTermsPage.consent(label)).toBeChecked()
    await reviewTermsPage.clickConsentLabel(label)
    await expect(reviewTermsPage.consent(label)).not.toBeChecked()

    await reviewTermsPage.checkAllConsents()
    await expect(reviewTermsPage.continueButton).toBeEnabled()

    // Step 1/4, with the account email prefilled
    const profileStep = await reviewTermsPage.acceptTerms()
    await profileStep.verifyPageLoaded()
    await expect(profileStep.emailInput).toBeDisabled()
    await expect(profileStep.emailInput).toHaveValue(account.email)

    // Accepted terms redirect forward
    await reviewTermsPage.goto('/app/review-terms')
    await profileStep.verifyPageLoaded()
    await reviewTermsPage.goto('/app/')
    await profileStep.verifyPageLoaded()
  })

  test('OB-004 Profile step requires first and last name @onboarding @validation', async ({ page }) => {
    const profileStep = await signIn(page, 'profile')
    await profileStep.verifyPageLoaded()
    await expect(profileStep.profilePictureInput).toHaveAttribute('accept', 'image/*')
    await expect(profileStep.continueButton).toBeEnabled()

    await profileStep.submit()
    expect(await profileStep.getErrors()).toEqual(['First name is required', 'Last name is required'])
    await expect(profileStep.stepNumber).toHaveText('1/4')

    // Whitespace counts as empty
    await profileStep.fillFirstName('   ')
    await profileStep.fillLastName('   ')
    await profileStep.submit()
    expect(await profileStep.getErrors()).toEqual(['First name is required', 'Last name is required'])

    await profileStep.fillFirstName('Qa')
    await profileStep.fillLastName('')
    await profileStep.submit()
    expect(await profileStep.getErrors()).toEqual(['Last name is required'])

    await profileStep.fillFirstName('')
    await profileStep.fillLastName('Onboarding')
    await profileStep.submit()
    expect(await profileStep.getErrors()).toEqual(['First name is required'])
    await expect(profileStep.stepNumber).toHaveText('1/4')
  })

  test('OB-005 Profile step saves the name @onboarding @positive', async ({ page }) => {
    const profileStep = await signIn(page, 'profile')
    await profileStep.verifyPageLoaded()

    const workspaceStep = await profileStep.saveProfile('Qa', 'Onboarding')
    await expect(profileStep.toast('Profile created Successfully')).toBeVisible()
    await workspaceStep.verifyPageLoaded()
    await expect(workspaceStep.heading).toBeVisible()

    // The step is kept on reload
    await page.reload({ waitUntil: 'domcontentloaded' })
    await workspaceStep.verifyPageLoaded()
  })

  test('OB-006 Company name validation @onboarding @validation', async ({ page }) => {
    const workspaceStep = await signIn(page, 'workspace')
    await workspaceStep.verifyPageLoaded()
    await expect(workspaceStep.heading).toBeVisible()
    await expect(page.getByText('Profile Picture', { exact: true })).toBeVisible()
    await expect(workspaceStep.companyNameInput).toBeVisible()

    await workspaceStep.submit()
    expect(await workspaceStep.getCompanyNameError()).toBe('Company name is required')

    await workspaceStep.fillCompanyName('   ')
    await workspaceStep.submit()
    expect(await workspaceStep.getCompanyNameError()).toBe('Company name is required')

    // The value is trimmed, so " AB " counts as 2 characters
    for (const name of ['A', 'ABC', ' AB ']) {
      await workspaceStep.fillCompanyName(name)
      await workspaceStep.submit()
      expect(await workspaceStep.getCompanyNameError()).toBe('Company name must be at least 4 characters')
    }

    // maxlength 20 only applies to typed input
    await workspaceStep.fillCompanyName('')
    await workspaceStep.companyNameInput.pressSequentially('ABCDEFGHIJKLMNOPQRSTUVWXY')
    await expect(workspaceStep.companyNameInput).toHaveValue('ABCDEFGHIJKLMNOPQRST')

    await workspaceStep.fillCompanyName('')
    await expect(workspaceStep.companyNameInput).toHaveValue('')
    await expect(workspaceStep.stepNumber).toHaveText('2/4')
  })

  test('OB-007 Organization terms gate the workspace creation @onboarding @validation', async ({ page }) => {
    const workspaceStep = await signIn(page, 'workspace')
    await workspaceStep.verifyPageLoaded()
    await expect(workspaceStep.companyNameInput).toBeVisible()

    const termsPage = await workspaceStep.continueToTerms(companyName)
    await termsPage.verifyPageLoaded()
    await expect(termsPage.heading).toBeVisible()
    await expect(termsPage.intro).toBeVisible()
    await expect(termsPage.stepNumber).toHaveCount(0)

    // Four sections, one open at a time, each with its full-document link
    const links = {
      'Master Service Agreement': 'https://complya.com/msa',
      'Privacy Policy': 'https://complya.com/privacy',
      'Business Associate Agreement': 'https://complya.com/baa',
      'Terms of Service': 'https://complya.com/terms',
    }
    await expect(termsPage.section('Master Service Agreement')).toHaveAttribute('aria-expanded', 'true')
    for (const name of OrganizationTermsPage.SECTIONS) {
      await termsPage.openSection(name)
      for (const other of OrganizationTermsPage.SECTIONS) {
        await expect(termsPage.section(other)).toHaveAttribute('aria-expanded', other === name ? 'true' : 'false')
      }
      const link = termsPage.documentLink(name)
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', links[name])
      await expect(link).toHaveAttribute('target', '_blank')
    }

    await expect(termsPage.agreementCheckbox).not.toBeChecked()
    await expect(termsPage.newsletterCheckbox).not.toBeChecked()
    await expect(termsPage.continueButton).toBeDisabled()

    // The newsletter box alone is not enough; the agreement is required
    await termsPage.checkNewsletter()
    await expect(termsPage.continueButton).toBeDisabled()
    await termsPage.checkAgreement()
    await expect(termsPage.continueButton).toBeEnabled()

    // Nothing is saved: a reload returns to step 2/4 with an empty name
    const reloadedStep = await termsPage.reload()
    await reloadedStep.verifyPageLoaded()
    await expect(reloadedStep.companyNameInput).toHaveValue('')
  })

  test('OB-008 Accepting the organization terms creates the workspace @onboarding @smoke @positive', async ({ page }) => {
    const workspaceStep = await signIn(page, 'workspace')
    await workspaceStep.verifyPageLoaded()
    await expect(workspaceStep.companyNameInput).toHaveValue('')

    const termsPage = await workspaceStep.continueToTerms(companyName)
    await termsPage.verifyPageLoaded()

    const setupStep = await termsPage.acceptTerms()
    await expect(termsPage.toast('WorkSpace Created Successfully!')).toBeVisible()
    await setupStep.verifyPageLoaded()
    await expect(setupStep.heading).toBeVisible()
    await expect(setupStep.organizationNameInput).toBeDisabled()
    await expect(setupStep.organizationNameInput).toHaveValue(companyName)
  })

  test('OB-009 Workspace Setup requires all mandatory fields @onboarding @validation', async ({ page }) => {
    const setupStep = await signIn(page, 'workspaceSetup')
    await setupStep.verifyPageLoaded()
    await expect(setupStep.organizationNameInput).toBeDisabled()
    await expect(setupStep.organizationNameInput).toHaveValue(companyName)
    await expect(setupStep.fields.phone).toHaveValue('+1')
    for (const field of Object.values(setupStep.fields)) await expect(field).toBeVisible()
    await expect(setupStep.continueButton).toBeVisible()

    await setupStep.submit()
    expect(await setupStep.getErrors()).toEqual([
      'Phone number is required',
      'NPI is required',
      'EIN is required',
      'Billing email is required',
      'Address is required',
      'City is required',
      'ZIP is required',
      'State is required',
    ])
    // Fax is optional
    await expect(setupStep.errorFor(setupStep.fields.fax)).toHaveCount(0)
    await expect(setupStep.stepNumber).toHaveText('3/4')
  })

  test('OB-010 Workspace Setup validates formats and masks input @onboarding @validation', async ({ page }) => {
    const setupStep = await signIn(page, 'workspaceSetup')
    await setupStep.verifyPageLoaded()
    await expect(setupStep.fields.phone).toHaveValue('+1')
    await expect(setupStep.fields.npi).toHaveValue('')

    await setupStep.fillDetails({ phone: '123', fax: '12', npi: '12345', ein: '12345', billingEmail: 'billing@', zip: '123' })
    await setupStep.submit()
    expect(await setupStep.getError('phone')).toBe('Phone number must be a valid 10-digit US number')
    expect(await setupStep.getError('fax')).toBe('Fax must be in the format (XXX) XXX-XXXX')
    expect(await setupStep.getError('npi')).toBe('NPI must be exactly 10 digits')
    expect(await setupStep.getError('ein')).toBe('EIN must be in the format XX-XXXXXXX')
    expect(await setupStep.getError('billingEmail')).toBe('Billing email must be a valid email')
    expect(await setupStep.getError('zip')).toBe('ZIP must be in the format 12345 or 12345-6789')
    await expect(setupStep.stepNumber).toHaveText('3/4')

    await setupStep.fillDetails({ npi: '123456789', billingEmail: 'billing.example.com', zip: '123456' })
    await setupStep.submit()
    expect(await setupStep.getError('npi')).toBe('NPI must be exactly 10 digits')
    expect(await setupStep.getError('billingEmail')).toBe('Billing email must be a valid email')
    expect(await setupStep.getError('zip')).toBe('ZIP must be in the format 12345 or 12345-6789')

    // Masks
    await setupStep.fillDetails({ phone: '7025550123', fax: '5551234567', ein: '123456789' })
    await expect(setupStep.fields.phone).toHaveValue('+1 (702) 555-0123')
    await expect(setupStep.fields.fax).toHaveValue('(555) 123-4567')
    await expect(setupStep.fields.ein).toHaveValue('12-3456789')
    await setupStep.fillField('ein', '1a2b3c4d5e6f7g8h9')
    await expect(setupStep.fields.ein).toHaveValue('12-3456789')
    await setupStep.fillField('npi', '12345678901')
    await expect(setupStep.fields.npi).toHaveValue('1234567890')
    await setupStep.fillField('zip', '123456')
    await expect(setupStep.fields.zip).toHaveValue('12345-6')
    await setupStep.fillField('zip', '733011234')
    await expect(setupStep.fields.zip).toHaveValue('73301-1234')

    // Letters are dropped from the NPI, so it counts as empty
    await setupStep.fillField('npi', 'abcdefghij')
    await expect(setupStep.fields.npi).toHaveValue('')
    await setupStep.submit()
    expect(await setupStep.getError('npi')).toBe('NPI is required')

    // Both valid ZIP formats are accepted
    for (const zip of ['73301', '73301-1234']) {
      await setupStep.fillField('zip', zip)
      await setupStep.submit()
      await expect(setupStep.errorFor(setupStep.fields.zip)).toHaveCount(0)
    }
    await expect(setupStep.stepNumber).toHaveText('3/4')
  })

  test('OB-011 Workspace Setup saves valid details @onboarding @positive', async ({ page }) => {
    const setupStep = await signIn(page, 'workspaceSetup')
    await setupStep.verifyPageLoaded()
    await expect(setupStep.heading).toBeVisible()

    const inviteStep = await setupStep.saveDetails(workspaceDetails)
    await expect(setupStep.toast('Save Successfully!')).toBeVisible()
    await inviteStep.verifyPageLoaded()
    await expect(inviteStep.heading).toBeVisible()
  })

  test('OB-012 Invite step adds and removes emails without sending invites @onboarding @validation', async ({ page }) => {
    const inviteStep = await signIn(page, 'invite')
    await inviteStep.verifyPageLoaded()
    await expect(page.getByText('The more your teammates use Complya, the more powerful it becomes.')).toBeVisible()
    await expect(page.getByText('Invite people to collaborate in Complya', { exact: true })).toBeVisible()
    await expect(inviteStep.emailInput).toBeVisible()
    await expect(inviteStep.roleButton).toHaveText('Staff')
    await expect(inviteStep.roleHint).toHaveText('Press enter to add more Staff.')
    await expect(inviteStep.sendInvitesButton).toBeVisible()
    await expect(inviteStep.skipButton).toBeVisible()

    // No emails: nothing is sent
    await inviteStep.clickSendInvites()
    await expect(inviteStep.toast('Please add atleast one email')).toBeVisible()

    // An invalid email is ignored and stays in the field
    await inviteStep.addEmail('not-an-email')
    await expect(inviteStep.emailInput).toHaveValue('not-an-email')
    await expect(inviteStep.invites).toHaveCount(0)

    await inviteStep.addEmail('qa.invite.one@example.com')
    await expect(inviteStep.invites).toHaveCount(1)
    await expect(inviteStep.emailInput).toHaveValue('')
    expect(await inviteStep.getInvites()).toEqual([{ email: 'qa.invite.one@example.com', role: 'staff' }])

    await inviteStep.openRoleMenu()
    await expect(inviteStep.roleMenu).toBeVisible()
    expect(await inviteStep.getRoleOptions()).toEqual(['Admin', 'Staff', 'Manager', 'Clinical'])
    await inviteStep.chooseRole('Admin')
    await expect(inviteStep.roleButton).toHaveText('Admin')
    await inviteStep.addEmail('qa.invite.two@example.com')
    await expect(inviteStep.invites).toHaveCount(2)
    expect(await inviteStep.getInvites()).toEqual([
      { email: 'qa.invite.one@example.com', role: 'staff' },
      { email: 'qa.invite.two@example.com', role: 'admin' },
    ])

    // A duplicate is ignored
    await inviteStep.addEmail('qa.invite.one@example.com')
    await expect(inviteStep.invite('qa.invite.one@example.com')).toHaveCount(1)
    await expect(inviteStep.invites).toHaveCount(2)

    await inviteStep.removeInvite('qa.invite.one@example.com')
    await expect(inviteStep.invites).toHaveCount(1)
    await inviteStep.removeInvite('qa.invite.two@example.com')
    await expect(inviteStep.invites).toHaveCount(0)

    // Unsent invites are not kept
    await inviteStep.addEmail('qa.invite.one@example.com')
    await expect(inviteStep.invites).toHaveCount(1)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await inviteStep.verifyPageLoaded()
    await expect(inviteStep.skipButton).toBeVisible()
    await expect(inviteStep.invites).toHaveCount(0)
  })

  test('OB-013 Skipping invites opens Add your signature @onboarding @positive', async ({ page }) => {
    const inviteStep = await signIn(page, 'invite')
    await inviteStep.verifyPageLoaded()
    await expect(inviteStep.skipButton).toBeVisible()

    const signaturePage = await inviteStep.skip()
    await signaturePage.verifyPageLoaded()
    await expect(signaturePage.heading).toBeVisible()
    await expect(page.getByText('Draw or type your signature. It is used when you sign session notes, and you can change it later under Signature in your Staff Details. We detected your time zone below; change it if it is not right.', { exact: true })).toBeVisible()
    await expect(signaturePage.addSignatureButton).toBeVisible()
    await expect(signaturePage.addSignatureButton).toHaveText('Click to draw or type your signature')
    await expect(signaturePage.continueButton).toBeDisabled()
    // The app preselects the browser time zone; check the value, as the label's UTC offset changes with DST
    await expect(signaturePage.timeZoneSelect).toHaveValue('America/Chicago')
    expect(await signaturePage.getTimeZone()).toBe('America/Chicago')
  })

  test('OB-014 Signature dialog requires a drawn or typed signature @onboarding @validation', async ({ page }) => {
    const signaturePage = await signIn(page, 'signature')
    await signaturePage.verifyPageLoaded()
    await expect(signaturePage.continueButton).toBeDisabled()

    const dialog = await signaturePage.openSignatureDialog()
    await dialog.verifyLoaded()
    await expect(dialog.dialog).toContainText('Signature')
    await expect(dialog.closeButton).toBeVisible()
    await expect(dialog.typeTab).toBeVisible()
    await expect(dialog.selectedTab).toHaveText('Draw')
    await expect(dialog.canvas).toBeVisible()
    await expect(dialog.cancelButton).toBeVisible()
    await expect(dialog.resetButton).toBeVisible()
    await expect(dialog.submitButton).toBeDisabled()

    await dialog.draw()
    await expect(dialog.submitButton).toBeEnabled()
    await dialog.reset()
    await expect(dialog.submitButton).toBeDisabled()

    await dialog.typeTab.click()
    await expect(dialog.typeInput).toBeVisible()
    await expect(dialog.typeInput).toHaveAttribute('maxlength', '100')
    await expect(dialog.dialog.getByText('Signature Preview', { exact: true })).toBeVisible()

    // Spaces only is not a signature
    await dialog.typeSignature('   ')
    await expect(dialog.submitButton).toBeDisabled()
    await dialog.typeSignature('Qa Onboarding')
    await expect(dialog.submitButton).toBeEnabled()
    await expect(dialog.preview).toContainText('Qa Onboarding')
    await dialog.reset()
    await expect(dialog.typeInput).toHaveValue('')
    await expect(dialog.submitButton).toBeDisabled()

    // Cancel and Close both leave the signature empty
    const afterCancel = await dialog.cancel()
    await expect(dialog.dialog).toBeHidden()
    await expect(afterCancel.continueButton).toBeDisabled()
    const reopened = await afterCancel.openSignatureDialog()
    await reopened.verifyLoaded()
    const afterClose = await reopened.close()
    await expect(reopened.dialog).toBeHidden()
    await expect(afterClose.continueButton).toBeDisabled()
  })

  test('OB-015 Completing onboarding shows Waiting for Approval @onboarding @smoke @positive', async ({ page }) => {
    const signaturePage = await signIn(page, 'signature')
    await signaturePage.verifyPageLoaded()
    await expect(signaturePage.continueButton).toBeDisabled()

    // Submitting the dialog only enables Continue; nothing is saved yet
    const submitted = await signaturePage.addTypedSignature('Qa Onboarding')
    await expect(submitted.continueButton).toBeEnabled()
    await expect(submitted.editSignatureButton).toBeVisible()
    const editDialog = await submitted.editSignature()
    await editDialog.verifyLoaded()
    const afterEdit = await editDialog.cancel()
    await expect(editDialog.dialog).toBeHidden()
    await expect(afterEdit.continueButton).toBeEnabled()

    // The time zone stays as detected
    await expect(afterEdit.timeZoneSelect).toHaveValue('America/Chicago')
    const waitingDialog = await afterEdit.finishOnboarding()
    await waitingDialog.verifyLoaded()
    await expect(page).toHaveURL(/\/app\/add-signature$/)
    await expect(waitingDialog.heading).toBeVisible()
    await expect(waitingDialog.workspaceName(companyName)).toBeVisible()
    await expect(waitingDialog.message).toBeVisible()
    await expect(waitingDialog.signOutButton).toBeVisible()
    await expect(waitingDialog.checkAgainButton).toBeVisible()
  })
})
