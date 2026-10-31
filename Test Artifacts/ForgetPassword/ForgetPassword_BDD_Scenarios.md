# Complya Forget Password - BDD Scenarios

| | |
|---|---|
| **Feature** | Forget password: request a reset email, set a new password from the link, sign in with it |
| **URL tested** | https://app.complya.dev/app/forget-password, /app/auth/action?mode=resetPassword, /app/reset-password |
| **Automation** | `tests/forget-password/fp-00x-*.spec.js` (FP-001 to FP-006; FP-006 covers FP-006a to FP-006e in one test) using `pages/forgetpasswordpage.js` (runs against app.complya.dev by default; set `APP_URL` to change). All 6 passed on 2026-10-31 |
| **Test plan** | `specs/forget-password-plan.md` |
| **Date** | 2026-10-31 |
| **Scope** | In: the Forget password link, the request form and its validation, the "Check your email" screen, the reset email, the reset page and its validation, a successful reset, signing in with the old and new password, used and invalid reset links. Out: "Click to resend" (would send extra email), Google/Apple sign-in, the reset email's wording beyond the link, rate limits, performance, security. |
| **Feature file** | `Test Artifacts/ForgetPassword/forget-password.feature` |

All UI text below was observed in a live browser with the Playwright MCP on the date above, unless marked **To be confirmed**. App typos are quoted as they appear.

## Page reference (as observed)

| Screen | URL | Heading | Elements |
|---|---|---|---|
| Login | `/app/sign-in` | "Login" | Link "Forget password" (wording as shown) to `/app/forget-password` |
| Forget Password | `/app/forget-password` | "Forget Password" | Email field (no label, placeholder "Enter your email address", `type=email`, required). "Send Email" button, always enabled. Footer links Terms and Privacy. No link back to login |
| Check your email | `/app/forget-password` (same URL) | "Check your email" | "We sent a password reset link to your email". "Don’t received the email? Click to resend" ("Click to resend" is plain text). "Terms and Conditions" and "Privacy Policy" links with an empty `href` |
| Reset email | (email) | — | From `noreply@complya.dev`, subject "Reset your password for complya.dev", one link to `/app/auth/action?mode=resetPassword&oobCode=...` |
| Reset Password | `/app/reset-password?oobCode=...` | "Reset Password" | "for <email>". Fields "New password" and "Confirm password", each with its own "Show password" toggle. Hints "Must contain 1 special character" and "Must be at least 8 characters". "Reset Password" button, always enabled |

## Messages (as observed)

| Where | Trigger | Message | Type |
|---|---|---|---|
| Forget Password | Empty email | "Please fill out this field." | Browser validation |
| Forget Password | `user.com` | "Please include an '@' in the email address. 'user.com' is missing an '@'." | Browser validation |
| Forget Password | `user@domain` | "Please enter a valid email address." | Red alert inside the form |
| Forget Password | Unregistered email (seen once) | "Failed to send reset email. Please try again." | Red alert inside the form |
| Reset Password | Empty fields | "Please fill out this field." | Browser validation |
| Reset Password | No special character | "Must contain 1 special character" | Error toast |
| Reset Password | Fewer than 8 characters | "Must be at least 8 characters" | Error toast |
| Reset Password | Passwords differ | "Passwords do not match" | Error toast |
| Reset Password | Success | "Password reset successfully! You can now sign in with your new password." | Success toast, then `/app/sign-in` |
| Login | Old password after reset | "Invalid email or password. Please try again." | Error toast |
| Login | Used reset link | "This link is invalid. It may have already been used." | Error toast |
| Forget Password | `/app/reset-password` with a made-up code | "This reset link is invalid or has already been used." | Error toast |
| Forget Password | `/app/reset-password` with no code | "Invalid password reset link. Please request a new one." | Error toast |

## Summary

| ID | Scenario | Priority | Type | Emails |
|---|---|---|---|---|
| FP-001 | Forget password link opens the form | High | Positive | 0 |
| FP-002 | Empty email is blocked | Medium | Validation | 0 |
| FP-003 | Invalid email format (2 examples) | Medium | Validation | 0 |
| FP-004 | Unregistered email | High | Negative | 0 |
| FP-005 | Invalid or missing reset code (2 examples) | Medium | Negative | 0 |
| FP-006a | Registered email gets the reset email | High | Positive | 1 (shared) |
| FP-006b | Reset page shows the account and the password rules | Medium | Positive | shared |
| FP-006c | Reset page password validation (4 examples) | Medium | Validation | shared |
| FP-006d | Reset with a valid password, then sign in | High | Positive | shared |
| FP-006e | A used reset link can't be opened again | High | Negative | shared |

10 scenarios, 15 test cases once the outline examples are counted. FP-006a to FP-006e run as one automated test (FP-006) on a single reset email, so a full run uses **1 testmail email**.

**Test data and side effects.**
- `<account_email>` is the existing onboarding account of workspace "QA Onboard 984491" (a testmail.app address). The `.env` login account (`USER_EMAIL`) is never used here. No accounts are created.
- Each run changes that account's password. It alternates between `<password_a>` and `<password_b>`: the test finds which one works now (`<current_password>`) and resets to the other (`<new_password>`). Both values come from configuration, never from these files.
- `<unregistered_email>` is a fresh testmail.app address with no account. No email is delivered to it.
- testmail.app's free plan allows 100 emails a month, and the app limits how often it sends reset emails. FP-006 must not run in parallel with itself.

## Scenarios

**Background:** Given I am on the Complya login page (`/app/sign-in`).

### FP-001 Forget password link opens the form
- **Given** I am on the Complya login page
- **When** I click "Forget password"
- **Then** I am taken to `/app/forget-password`
- **And** I see the heading "Forget Password", an empty email field and an enabled "Send Email" button
- **When** I go back in the browser
- **Then** I am on the login page again

### FP-002 Empty email is blocked
- **Given** I am on the Forget Password page
- **When** I click "Send Email" with the email field empty
- **Then** the browser shows "Please fill out this field."
- **And** no reset request is sent, and I stay on `/app/forget-password`

### FP-003 Invalid email format
- **Given** I am on the Forget Password page
- **When** I enter the email below and click "Send Email"
- **Then** I see the message below, and I stay on `/app/forget-password`

| Email | Expected message | Shown as |
|---|---|---|
| `user.com` | "Please include an '@' in the email address. 'user.com' is missing an '@'." | Browser validation, no request sent |
| `user@domain` | "Please enter a valid email address." | Red alert inside the form |

### FP-004 Unregistered email
- **Given** I am on the Forget Password page
- **When** I request a reset for `<unregistered_email>`
- **Then** no email is delivered to that address
- **And** I am not signed in
- **And** I see either the "Check your email" screen or the alert "Failed to send reset email. Please try again." (see Observations 1)

### FP-005 Invalid or missing reset code
- **When** I open the reset page with the code below
- **Then** I am taken to `/app/forget-password`
- **And** I see the error toast below

| Reset page URL | Expected toast |
|---|---|
| `/app/reset-password?oobCode=bogus` | "This reset link is invalid or has already been used." |
| `/app/reset-password` | "Invalid password reset link. Please request a new one." |

### FP-006a Registered email gets the reset email
- **Given** I am on the Forget Password page
- **When** I request a reset for `<account_email>`
- **Then** I see the heading "Check your email" and "We sent a password reset link to your email"
- **And** I stay on `/app/forget-password`
- **And** I receive an email from `noreply@complya.dev` with the subject "Reset your password for complya.dev"
- **And** the email has one link to `/app/auth/action?mode=resetPassword`

### FP-006b Reset page shows the account and the password rules
- **Given** I have a reset email for `<account_email>`
- **When** I open the link in the email
- **Then** I am taken to `/app/reset-password`
- **And** I see the heading "Reset Password" and "for `<account_email>`"
- **And** the "New password" and "Confirm password" fields are empty and masked
- **And** I see the hints "Must contain 1 special character" and "Must be at least 8 characters"
- **When** I type a password that meets a rule
- **Then** that hint changes to "Password contains a special character" or "Password has at least 8 characters"
- **When** I click "Show password" on one field
- **Then** only that field shows its value, and its toggle reads "Hide password"

### FP-006c Reset page password validation
- **Given** I am on the Reset Password page from a valid link
- **When** I enter the values below and click "Reset Password"
- **Then** I see the message below
- **And** the password is not changed, and I stay on `/app/reset-password`

| New password | Confirm password | Expected message | Shown as |
|---|---|---|---|
| empty | empty | "Please fill out this field." | Browser validation |
| `abcdefgh` | `abcdefgh` | "Must contain 1 special character" | Error toast |
| `abc!` | `abc!` | "Must be at least 8 characters" | Error toast |
| `QaValid1!` (any valid password) | `Different1!` | "Passwords do not match" | Error toast |

### FP-006d Reset with a valid password, then sign in
- **Given** I am on the Reset Password page from a valid link
- **When** I enter `<new_password>` in both fields and click "Reset Password"
- **Then** I see the success toast "Password reset successfully! You can now sign in with your new password."
- **And** I am taken to the login page (`/app/sign-in`)
- **When** I log in with `<account_email>` and `<current_password>` (the old one)
- **Then** I see the error toast "Invalid email or password. Please try again."
- **When** I log in with `<account_email>` and `<new_password>`
- **Then** I am taken to the Home page at `/app/`

### FP-006e A used reset link can't be opened again
- **Given** I have reset my password with the link in the email
- **And** I am signed out
- **When** I open the same link again
- **Then** I am taken to the login page (`/app/sign-in`)
- **And** I see the error toast "This link is invalid. It may have already been used."

## Observations / To be confirmed

1. **Unregistered email: inconsistent.** The first try returned a Firebase 503 and showed "Failed to send reset email. Please try again.", while a registered email showed "Check your email". That difference reveals which emails have accounts. Minutes later, two other unregistered addresses showed the same "Check your email" screen as a registered one, and no email arrived. FP-004 accepts both until the intended behaviour is confirmed. The safe behaviour is the "Check your email" screen for every address.
2. **"Click to resend": to be confirmed.** It is plain text (`<span>`), not a button or link, so it can't be reached with the keyboard. It was not clicked, to avoid sending extra email.
3. **Typo:** "Don’t received the email?" on the Check your email screen.
4. **Empty links:** "Terms and Conditions" and "Privacy Policy" on the Check your email screen have an empty `href`. The image there has the alt text "Email Verified", copied from signup.
5. **No way back:** the Forget Password page has no link back to login. Only the browser Back button works.
6. **Reset errors are toasts only.** The reset page shows rule and mismatch errors as toasts that disappear. There is no message next to the field, and the button is always enabled.
7. **Wrong continue URL.** The reset request asks Firebase to continue to `https://app.complya.dev/sign-in`, without `/app/`. The app redirects to `/app/sign-in` itself, so users don't see it today.
8. **Double code check.** Opening the reset page checks the code twice (two identical requests).
9. **"Forget password" wording.** The link and the page heading say "Forget", not "Forgot".
10. **Email arrival time.** testmail.app's timestamp for the reset email was slightly earlier than the local clock just before clicking "Send Email". Automated waits should start a few seconds early.
