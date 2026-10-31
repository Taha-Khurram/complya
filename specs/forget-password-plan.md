# Forget Password Test Plan

## Application Overview

Self-service password reset on the Complya web app (`https://app.complya.dev`, override with `APP_URL`).
The entry point is the **Forget password** link on the sign-in page (`/app/sign-in`), which opens `/app/forget-password`.

Flow, explored live on 2026-10-31:

1. `/app/sign-in` has the link "Forget password", which opens `/app/forget-password`.
2. `/app/forget-password` has an h6 heading "Forget Password" (plus an image with alt "Forget Password"), one `input[type=email][required]` with the placeholder "Enter your email address" (no label, so the accessible name is the placeholder) and a **Send Email** button that is always enabled. There is no back-to-login link. The footer has Terms and Privacy links. Validation on the form:
   - Empty submit: native message "Please fill out this field." No app message, no request.
   - `user.com`: native message "Please include an '@' in the email address. 'user.com' is missing an '@'."
   - `user@domain` passes native validation. Firebase `accounts:sendOobCode` returns 400 INVALID_EMAIL and an in-form `div.alert.alert-danger[role=alert]` shows "Please enter a valid email address." The alert stays while typing and is replaced on the next submit. Pressing Enter in the field submits the form the same way.
3. Unregistered email: **changed during this session.** Earlier today `sendOobCode` returned 503 ("Error code: 26") and the alert said "Failed to send reset email. Please try again." When re-checked with two fresh never-used addresses, `sendOobCode` returned 200 and the app showed the same "Check your email" screen as for a registered address, and no email is expected. The behaviour looks like it depends on the Firebase email-enumeration setting, so FP-004 accepts both outcomes (see FP-004).
4. Registered email: `sendOobCode` returns 200 and the same URL shows h6 "Check your email", the text "We sent a password reset link to your email", "Don’t received the email? Click to resend" ("Click to resend" is a plain `<span>`, behaviour not verified, **to be confirmed**) and "Terms and Conditions" / "Privacy Policy" links with `href=""`.
5. The email comes from `noreply@complya.dev`, subject "Reset your password for complya.dev", text "Follow this link to reset your complya.dev password for your <email> account.", with one link `https://app.complya.dev/app/auth/action?mode=resetPassword&oobCode=...&continueUrl=https%3A%2F%2Fapp.complya.dev%2Fsign-in&lang=en`. testmail's timestamp can be earlier than the local clock (about 0.6 s observed), so `receivedAfter` must start a few seconds early (now minus 10 s).
6. The link redirects to `/app/reset-password?oobCode=...` with h6 "Reset Password", the text "for <email>", password inputs with the placeholders "New password" and "Confirm password" (names `password` / `confirmPassword`, both required), a "Show password" toggle per field (switches the type and the aria-label to "Hide password", independently), and the hints "Must contain 1 special character" / "Must be at least 8 characters". A met hint changes to "Password contains a special character" / "Password has at least 8 characters". The submit button "Reset Password" is always enabled. On load the page calls `accounts:resetPassword` with only `{oobCode}` (a code check).
7. Reset page validation (no request is sent for any of these): empty gives native "Please fill out this field."; a failing rule gives a react-toastify error toast with that rule's text ("Must contain 1 special character" / "Must be at least 8 characters"); a mismatch gives the toast "Passwords do not match".
8. A valid matching password shows the toast "Password reset successfully! You can now sign in with your new password." and redirects to `/app/sign-in`. The old password then gives the login toast "Invalid email or password. Please try again."; the new password opens `/app/` Home (heading "Home", with a product tour "1 of 13" overlay).
9. Invalid links:
   - Re-opening the used email link goes to `/app/sign-in` with the toast "This link is invalid. It may have already been used."
   - `/app/reset-password?oobCode=bogus` goes to `/app/forget-password` with the toast "This reset link is invalid or has already been used."
   - `/app/reset-password` with no code goes to `/app/forget-password` with the toast "Invalid password reset link. Please request a new one."
10. Browser Back from `/app/forget-password` (after opening it from sign-in and getting the invalid-email alert) returns to `/app/sign-in`. Loading `/app/forget-password` directly works.

Page objects (proposed): `pages/forgetpasswordpage.js` (`ForgetPasswordPage`, `CheckResetEmailPage`, `ResetPasswordPage`), `pages/loginpage.js` (new `clickForgetPassword`), `pages/dashboardpage.js` (existing, for the Home check).
Email helper: `utils/testmail.js` (`generateEmailAddress`, `waitForEmail`, `getLinks`).

### Page object design

New file `pages/forgetpasswordpage.js`, same style as `loginpage.js` and `signuppage.js` (comment header, CommonJS, role/placeholder locators, 4-space indent, no semicolons). Fluent style: any method that navigates returns the destination page object. Specs only `new LoginPage(page)` (the entry page) and never `new` a destination page.

**Change to `pages/loginpage.js`:** add the locator `this.forgetPasswordLink = page.getByRole('link', { name: 'Forget password', exact: true })` and the method `async clickForgetPassword()` that clicks it and returns `new ForgetPasswordPage(this.page)`. `forgetpasswordpage.js` needs to return a `LoginPage` too, and `loginpage.js` requires it at the top, so `forgetpasswordpage.js` requires `./loginpage` lazily inside the methods (the same pattern as `signuppage.js` `clickLogIn`).

**Class `ForgetPasswordPage`** (`/app/forget-password`)
- Locators: `heading` = `getByRole('heading', { name: 'Forget Password', exact: true })`; `emailInput` = `getByRole('textbox', { name: 'Enter your email address', exact: true })` (or `getByPlaceholder('Enter your email address')`); `sendEmailButton` = `getByRole('button', { name: 'Send Email', exact: true })`; `formError` = `page.locator('div.alert.alert-danger[role="alert"]')` (the in-form alert; the toast is a different element); `termsLink` / `privacyLink` = `getByRole('link', { name: 'Terms', exact: true })` / `'Privacy'`.
- `async goto()`: `page.goto('/app/forget-password', { waitUntil: 'domcontentloaded' })`, waits for `emailInput` to be visible, returns `this`.
- `async verifyPageLoaded()`: `expect(page).toHaveURL(/\/app\/forget-password$/, { timeout: 60000 })` and `expect(heading).toBeVisible({ timeout: 60000 })` (the bundle can take 30s+).
- `async fillEmail(email)`: clear then fill.
- `async submit()`: clicks **Send Email**; stays on this page (used for validation cases).
- `async submitWithEnter()`: `emailInput.press('Enter')`.
- `async requestReset(email)`: fill, submit, return `new CheckResetEmailPage(this.page)`. Used only when the form is expected to succeed.
- `async getEmailValidationMessage()`: `emailInput.evaluate(e => e.validationMessage)` (native message).
- `async getFormError()`: trimmed text of `formError`.
- `async getEmailValue()`.
- `async isSendEmailEnabled()`.

**Class `CheckResetEmailPage`** (same URL, after a successful request)
- Locators: `heading` = `getByRole('heading', { name: 'Check your email', exact: true })`; `sentMessage` = `getByText('We sent a password reset link to your email', { exact: true })`; `resendText` = `getByText('Click to resend', { exact: true })` (a plain span); `termsLink` / `privacyLink` (`getByRole('link', { name: 'Terms and Conditions' })` and `'Privacy Policy'`, `href=""`).
- `async verifyPageLoaded()`: heading visible, timeout 60000.
- `async openResetLink(link)`: `page.goto(link, { waitUntil: 'domcontentloaded' })` and returns `new ResetPasswordPage(this.page)`.

**Class `ResetPasswordPage`** (`/app/reset-password?oobCode=...`)
- Locators: `heading` = `getByRole('heading', { name: 'Reset Password', exact: true })`; `emailText` = `getByText(/^for /)` (shows the account email); `passwordInput` = `getByPlaceholder('New password')`; `confirmPasswordInput` = `getByPlaceholder('Confirm password')`; `resetButton` = `getByRole('button', { name: 'Reset Password', exact: true })`; the toggles are scoped to their field because both have the same name: `passwordToggle` / `confirmPasswordToggle` = the field's `.form-group` (or parent) `.getByRole('button', { name: /^(Show|Hide) password$/ })`; hints `specialCharacterRule` = `getByText(/^(Must contain 1 special character|Password contains a special character)$/)` and `minLengthRule` = `getByText(/^(Must be at least 8 characters|Password has at least 8 characters)$/)`; `toast` = `getByRole('alert')` (react-toastify).
- `async verifyPageLoaded()`: URL matches `/\/app\/reset-password\?oobCode=/` and the heading is visible, timeout 60000.
- `async fillPassword(pw)`, `async fillConfirmPassword(pw)`, `async submit()` (stays here, used by validation cases).
- `async resetPassword(pw, confirm = pw)`: fills both fields, clicks **Reset Password**, returns `new LoginPage(this.page)` (the app redirects to `/app/sign-in`). Only used for the successful case; failed attempts use `fillPassword`, `fillConfirmPassword` and `submit()`.
- `async togglePasswordVisibility()`, `async toggleConfirmPasswordVisibility()`.
- `async isPasswordMasked()`, `async isConfirmPasswordMasked()` (type attribute), `async getPasswordToggleLabel()`.
- `async getToastText()`: trimmed text of the toast (wait for the text, because toasts can vanish).
- `async getPasswordValidationMessage()`: native `validationMessage` of the empty field.

**Link helpers** (open a URL the user would get, and return the page the app redirects to)
- `ForgetPasswordPage.openResetLinkWithCode(query)`: `page.goto('/app/reset-password' + query)` (e.g. `'?oobCode=bogus'` or `''`) and returns `this`, because the app redirects back to `/app/forget-password`. FP-005 starts from `new ForgetPasswordPage(page).goto()`.
- `CheckResetEmailPage.openUsedResetLink(link)`: `page.goto(link)` and returns `new LoginPage(this.page)`, because the app redirects a used link to `/app/sign-in`. Same idea as `EmailVerifiedPage.gotoUsedLink` in `signuppage.js`.

**Existing methods reused**
- `LoginPage.getFormError()` reads the `role="alert"` toast ("Invalid email or password. Please try again.", "This link is invalid. It may have already been used.").
- `LoginPage.login(email, password)` returns `DashboardPage` for the Home check.

### Test data and side effects

- **Emails.** testmail.app free plan: 100 emails a month, and the app has its own send limit. The whole plan uses **at most 1 testmail email per run (FP-006)**, leaving room for 1 more. FP-001 to FP-005 send **no email** and are safe to run any time.
- **Never use `USER_EMAIL` / `USER_PASSWORD`.** That account is reserved for the login tests.
- **Account for FP-006:** the existing onboarding account of workspace "QA Onboard 984491", `<TESTMAIL_NAMESPACE>.onboarding.1793444984776if5o@inbox.testmail.app` (build it from `TESTMAIL_NAMESPACE`; pass the tag to `waitForEmail` by using the full address). Do not create accounts.
- **Predictable password.** Each run changes this account's password. The password alternates between `QaReset1!` and `QaReset2!`. The current password at the time this plan was written is `QaReset1!`. At the start of FP-006 find which one works (sign in with `QaReset1!`; if the toast is "Invalid email or password. Please try again.", the current one is `QaReset2!`), reset to the other, then check that the old one is rejected and the new one works. If neither works, the test fails with a clear message (the account state is unknown; fix it by hand).
- **Unregistered address (FP-004):** a fresh never-used `generateEmailAddress('fp-unknown')`. No email is sent (the address is not registered with Firebase), so it does not use the testmail quota, and nothing is read from the inbox.
- **No parallel email tests.** FP-006 changes shared account state and must not run in parallel with other tests that use this account (use `test.describe.configure({ mode: 'serial' })` and keep the single email test in one file; tag `@email`).
- Skip FP-006 when `TESTMAIL_API_KEY` or `TESTMAIL_NAMESPACE` is not set.
- Test passwords: 8+ characters with a special character.
- Toasts can vanish before they are read: wait for the text with `expect(...).toHaveText` or `getByText(...).waitFor`, do not take a one-off snapshot.

### Known issues (not asserted)

- Account enumeration: earlier today an unregistered email gave 503 and "Failed to send reset email. Please try again." while a registered one gave the "Check your email" screen. Later in the same session unregistered addresses gave the same "Check your email" screen. Behaviour is inconsistent, so FP-004 allows both. A fixed (non-enumerating) behaviour would be the "Check your email" screen for both.
- The check-your-email screen says "Don’t received the email?" (typo).
- "Click to resend" is a plain `<span>`, not a button or link, so it can't be reached with the keyboard. Its behaviour has not been verified (to be confirmed) and the plan never clicks it, to avoid sending extra email.
- The "Terms and Conditions" and "Privacy Policy" links on the Check-your-email screen have an empty `href`.
- The email's `continueUrl` is `https://app.complya.dev/sign-in` (no `/app/`).
- There is no back-to-login link on the forget-password page.
- Reset-page errors appear only as toasts, with no inline or ARIA field errors.
- The `accounts:resetPassword` code check request fires twice on load of the reset page.
- The "Check your email" screen image has the alt text "Email Verified" (copied from the signup flow).

## Test Scenarios

### 1. Forget Password

**Seed:** `tests/seed.spec.js`

#### 1.1. FP-001 Forget password link opens the form @forget-password @smoke @positive

**File:** `tests/forget-password/fp-001-forget-password-page-load.spec.js`

**Steps:**
  1. No email sent. Open `/app/sign-in` with `new LoginPage(page).goto()` and click **Forget password** (`clickForgetPassword()`).
    - expect: The URL is `/app/forget-password`.
    - expect: The heading "Forget Password" is visible.
    - expect: The email field (placeholder "Enter your email address") is visible, empty and `type=email`.
    - expect: **Send Email** is visible and enabled.
    - expect: There is no back-to-login link; the footer Terms and Privacy links are visible.
  2. Press browser Back.
    - expect: The URL is `/app/sign-in` and the sign-in email field is visible.
  3. Open `/app/forget-password` directly with `goto()`.
    - expect: The form is shown the same as in step 1.

#### 1.2. FP-002 Empty email is blocked by native validation @forget-password @validation

**File:** `tests/forget-password/fp-002-empty-email.spec.js`

**Steps:**
  1. No email sent. Open `/app/forget-password` and click **Send Email** with the field empty.
    - expect: The native validation message is "Please fill out this field.".
    - expect: No `accounts:sendOobCode` request is sent (check with `page.on('request')`).
    - expect: No in-form alert is shown and the URL is still `/app/forget-password`.

#### 1.3. FP-003 Invalid email formats @forget-password @validation @negative

**File:** `tests/forget-password/fp-003-invalid-email-format.spec.js`

**Steps:**
  1. No email sent. Open `/app/forget-password`, enter `user.com` and click **Send Email**.
    - expect: The native validation message is "Please include an '@' in the email address. 'user.com' is missing an '@'.".
    - expect: No request is sent.
  2. Enter `user@domain` and click **Send Email**.
    - expect: The in-form alert (`role=alert`) says "Please enter a valid email address.".
    - expect: `accounts:sendOobCode` returned 400 and the URL is still `/app/forget-password`.
  3. Type more characters into the field.
    - expect: The alert is still shown while typing.
  4. Replace the value with `other@domain` and press Enter in the field.
    - expect: The form submits (Enter works) and the alert is replaced by a fresh "Please enter a valid email address." alert (only one alert is visible).

#### 1.4. FP-004 Unregistered email @forget-password @negative

**File:** `tests/forget-password/fp-004-unregistered-email.spec.js`

**Steps:**
  1. No email sent. Open `/app/forget-password`, enter a fresh `generateEmailAddress('fp-unknown')` and click **Send Email**.
    - expect: Observed on 2026-10-31 (latest): `sendOobCode` returns 200 and the "Check your email" screen is shown with "We sent a password reset link to your email".
    - expect: Earlier the same day: 503 and the alert "Failed to send reset email. Please try again." The test accepts either outcome (screen or alert) and logs which one it saw, so a backend setting change does not fail it.
    - expect: In both cases no email is delivered (confirmed: nothing reached the testmail inbox for the unregistered addresses tried on 2026-10-31) and the user is not signed in.
    - expect: If the alert is shown, the URL is still `/app/forget-password`.

#### 1.5. FP-005 Invalid or missing reset code redirects to the forget-password page @forget-password @negative

**File:** `tests/forget-password/fp-005-invalid-reset-links.spec.js`

**Steps:**
  1. No email sent. Open `/app/forget-password`, then `openResetLinkWithCode('?oobCode=bogus')`.
    - expect: The app redirects to `/app/forget-password`.
    - expect: The toast is "This reset link is invalid or has already been used." (wait for the text).
    - expect: The "Forget Password" heading is visible.
  2. `openResetLinkWithCode('')` (no code).
    - expect: The app redirects to `/app/forget-password`.
    - expect: The toast is "Invalid password reset link. Please request a new one.".

#### 1.6. FP-006 Full password reset by email: reset page, validation, success, old and new password, reused link @forget-password @smoke @positive @email

**File:** `tests/forget-password/fp-006-reset-password-by-email.spec.js`

**Steps:**
  1. Uses 1 testmail email. Skip when `TESTMAIL_API_KEY`/`TESTMAIL_NAMESPACE` is not set. Build the account address from `TESTMAIL_NAMESPACE` (`<ns>.onboarding.1793444984776if5o@inbox.testmail.app`). Open `/app/sign-in` and sign in with `QaReset1!`; if the toast is "Invalid email or password. Please try again.", the current password is `QaReset2!`. Set `current`, `next` to the other one.
    - expect: Exactly one of the two passwords works (the account lands on `/app/` Home). If neither works, fail with a clear message.
    - Do this check in a separate page (`browser.newPage({ baseURL })`, its own context) and close it, so the test page stays signed out. Signing out through the UI isn't possible because the product tour overlay blocks the profile menu, and dismissing the tour would change the account.
  2. Open `/app/sign-in`, click **Forget password**, take `receivedAfter = new Date(Date.now() - 10000)`, then `requestReset(account email)`.
    - expect: The URL stays `/app/forget-password` and the heading is "Check your email".
    - expect: The text "We sent a password reset link to your email" is visible.
    - expect: "Don’t received the email? Click to resend" is visible (do not click "Click to resend").
    - expect: "Terms and Conditions" and "Privacy Policy" links are visible.
  3. `waitForEmail(address, { receivedAfter })` and read the link with `getLinks`.
    - expect: The sender is `noreply@complya.dev` and the subject is "Reset your password for complya.dev".
    - expect: The text mentions "Follow this link to reset your complya.dev password for your <email> account.".
    - expect: There is a single link containing `/app/auth/action?mode=resetPassword&oobCode=`.
  4. Open the link.
    - expect: The URL becomes `/app/reset-password?oobCode=...`.
    - expect: The heading is "Reset Password" and the page shows "for <email>".
    - expect: The fields "New password" and "Confirm password" are empty and masked.
    - expect: The hints "Must contain 1 special character" and "Must be at least 8 characters" are visible and **Reset Password** is enabled.
  5. Fill both password fields and click each "Show password" toggle.
    - expect: Each toggle shows its own field and its label becomes "Hide password"; the other field stays masked until its own toggle is clicked. Click again to mask both.
  6. Type `abcdefgh` in the new password field, then `abc!` (replace).
    - expect: With `abcdefgh` the first hint is still "Must contain 1 special character" and the second becomes "Password has at least 8 characters".
    - expect: With `abc!` the first becomes "Password contains a special character" and the second is "Must be at least 8 characters".
    - expect: With the next valid value both show the met text.
  7. Click **Reset Password** with both fields empty.
    - expect: The native message "Please fill out this field." is shown and no request is sent.
  8. Submit `abcdefgh` / `abcdefgh`, then `abc!` / `abc!`, then `<next>` / `Different1!` (use a valid `next` for the first field).
    - expect: Toast "Must contain 1 special character" for `abcdefgh`.
    - expect: Toast "Must be at least 8 characters" for `abc!`.
    - expect: Toast "Passwords do not match" for the mismatch.
    - expect: No reset request is sent and the URL stays on `/app/reset-password`.
  9. Enter `<next>` in both fields and click **Reset Password** (`resetPassword(next)`).
    - expect: The toast is "Password reset successfully! You can now sign in with your new password.".
    - expect: The URL becomes `/app/sign-in`.
  10. While still signed out, open the same email link again (`openUsedResetLink(link)`). This comes before the sign-ins so no sign-out is needed.
    - expect: The URL is `/app/sign-in` and the toast is "This link is invalid. It may have already been used.".
  11. Sign in with the old password (`current`).
    - expect: The toast is "Invalid email or password. Please try again.".
    - expect: The URL stays `/app/sign-in`.
  12. Sign in with the new password (`next`).
    - expect: The URL is `/app/` and the heading "Home" is visible (a product tour overlay "1 of 13" may appear; ignore it).
  - Between steps 9 to 12, wait for open toasts to close: the sign-in page reads a single `role=alert`.
