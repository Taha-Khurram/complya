# Signup Test Plan

## Application Overview

Self-serve account signup on the Complya web app (`https://app.complya.dev`, override with `APP_URL`).
The only entry point is the **Sign Up** link on the sign-in page (`/app/sign-in`), which opens `/app/signup`.
The marketing site (complya.dev) has no signup link.

Flow, explored live on 2026-10-31:

1. `/app/signup` has the heading "Sign up", the fields **Enter your email address**, **Enter Password** and **Confirm Password**, a "Show password" toggle on each password field, and a disabled **Create Account** button.
   - Two hints under the password, "Must contain 1 special character" and "Must be at least 8 characters", are removed as each rule is met. **Create Account** enables once both are met, even when the email or confirm field is empty.
   - Inline errors (`.validation-message` in the field's `.form-group`): "Email is required", "Invalid email address", "Confirm password is required", "Passwords must match". No signup request is sent while any of them shows.
2. Registered email: Firebase `accounts:signUp` returns 400, a toast (`role="alert"`) says "An account with this email already exists", and the form is cleared.
3. New email: a toast says "Account created Successfully! Please check your email for verification." and the URL becomes `/app/new-verify/<email>`, with the heading "Check your email" and "We sent a verification link to <email>".
4. A verification email arrives from `noreply@complya.dev`, with the subject "Verify your email for complya.dev" and a single link to `/app/auth/action?mode=verifyEmail&oobCode=...`.
5. Signing in before verifying keeps the user on `/app/sign-in`, shows the toast "Please verify your email before signing in. Check your inbox for the verification link." and the inline text "Email not verified. Resend verification email".
6. The verification link opens `/app/email/verified` with the heading "Email Verified!" and a **Log in** link. Opening the same link again redirects to `/app/sign-in` with the toast "This link is invalid. It may have already been used."
7. The first login after verifying opens onboarding at `/app/review-terms` (heading "Review our terms"). This plan ends there. The onboarding steps are out of scope.

Page objects: `pages/signuppage.js` (`SignUpPage`, `CheckEmailPage`, `EmailVerifiedPage`), `pages/onboardingpage.js` (`OnboardingPage`), `pages/loginpage.js` (`clickSignUp`, `loginToOnboarding`, `emailNotVerifiedMessage`).
Email helper: `utils/testmail.js`.

### Test data and side effects

- SU-001 to SU-007 never submit valid data, so they create nothing.
- SU-008 uses `USER_EMAIL` from `.env` and is skipped when it isn't set. It creates nothing.
- SU-009 creates a **permanent dev account** each run and uses **1 testmail.app email** (the free plan allows 100 a month). Use `generateEmailAddress('signup')` and pass `receivedAfter`. Keep the whole journey in one test so each run sends only one email.
- Password for new accounts: any value with 8+ characters and a special character, e.g. `QaSignup1!`.

### Known issues (not asserted)

- The check-email page says "Don't received the email?" (typo).
- "Click to resend" is a plain `<span>`, not a button or link, so it can't be reached with the keyboard.
- The "Email Verified!" page subtitle says "We sent a verification link to your email".
- The password inputs keep the typed password in the DOM `value` attribute, the same issue as the login page.
- The signup error reveals whether an email is registered, while the login page uses a generic message. This is accepted for now (SU-008 asserts the current text).

## Test Scenarios

### 1. Signup

**Seed:** `tests/seed.spec.js`

#### 1.1. SU-001 Sign Up link opens the signup form @signup @smoke @positive

**File:** `tests/signup/su-001-signup-page-load.spec.js`

**Steps:**
  1. Open `/app/sign-in` and click **Sign Up**.
    - expect: The URL is `/app/signup`.
    - expect: The heading "Sign up" is visible.
    - expect: The email, password and confirm password fields are visible and empty.
    - expect: Both password hints are visible.
    - expect: **Create Account** is disabled.

#### 1.2. SU-002 Log In link returns to sign-in @signup @positive

**File:** `tests/signup/su-002-log-in-link.spec.js`

**Steps:**
  1. Open `/app/signup` and click **Log In**.
    - expect: The URL is `/app/sign-in` and the email field is visible.

#### 1.3. SU-003 Required-field validation @signup @smoke @validation

**File:** `tests/signup/su-003-required-fields.spec.js`

**Steps:**
  1. Open `/app/signup`, enter a valid password (`QaSignup1!`) only, and click **Create Account**.
    - expect: The email error is "Email is required".
    - expect: The confirm password error is "Confirm password is required".
    - expect: The URL is still `/app/signup`.

#### 1.4. SU-004 Invalid email format @signup @validation

**File:** `tests/signup/su-004-invalid-email-format.spec.js`

**Steps:**
  1. For each of `user@` and `user.com`: open `/app/signup`, enter the email and a matching valid password in both fields, and click **Create Account**.
    - expect: The email error is "Invalid email address".
    - expect: The URL is still `/app/signup`.

#### 1.5. SU-005 Password rules control the hints and Create Account @signup @validation

**File:** `tests/signup/su-005-password-rules.spec.js`

**Steps:**
  1. Open `/app/signup` and enter the password `abc`.
    - expect: Both hints are visible and **Create Account** is disabled.
  2. Enter `abcdefgh` (8 characters, no special character).
    - expect: Only "Must contain 1 special character" is visible and **Create Account** is disabled.
  3. Enter `abc!` (special character, too short).
    - expect: Only "Must be at least 8 characters" is visible and **Create Account** is disabled.
  4. Enter `QaSignup1!`.
    - expect: Both hints are hidden and **Create Account** is enabled.

#### 1.6. SU-006 Passwords must match @signup @smoke @validation

**File:** `tests/signup/su-006-passwords-must-match.spec.js`

**Steps:**
  1. Open `/app/signup`, enter a valid email, `QaSignup1!` as the password and `Different1!` as the confirmation, and click **Create Account**.
    - expect: The confirm password error is "Passwords must match".
    - expect: The URL is still `/app/signup`.

#### 1.7. SU-007 Passwords are masked and each toggle works on its own field @signup @positive

**File:** `tests/signup/su-007-password-masking.spec.js`

**Steps:**
  1. Open `/app/signup` and fill both password fields.
    - expect: Both fields are masked (`type="password"`).
  2. Click the password field's toggle.
    - expect: The password is shown, its toggle is labelled "Hide password", and the confirm field is still masked.
  3. Click the confirm field's toggle.
    - expect: Both fields are shown.
  4. Click both toggles again.
    - expect: Both fields are masked.

#### 1.8. SU-008 Registered email is rejected @signup @negative

**File:** `tests/signup/su-008-registered-email.spec.js`

**Steps:**
  1. Skip when `USER_EMAIL` is not set. Open `/app/signup`, enter `USER_EMAIL` and `QaSignup1!` in both password fields, and click **Create Account**.
    - expect: The toast is "An account with this email already exists".
    - expect: The URL is still `/app/signup`.
    - expect: The form is cleared and **Create Account** is disabled.

#### 1.9. SU-009 New account signs up, verifies its email and reaches onboarding @signup @smoke @positive

**File:** `tests/signup/su-009-signup-to-onboarding.spec.js`

Creates one dev account and sends one email. Skip when `TESTMAIL_API_KEY` or `TESTMAIL_NAMESPACE` is not set.

**Steps:**
  1. Generate a testmail address, open `/app/sign-in`, click **Sign Up**, and sign up with the address and `QaSignup1!`.
    - expect: The toast is "Account created Successfully! Please check your email for verification."
    - expect: The URL is `/app/new-verify/<email>`, the heading is "Check your email", and the page shows the address.
  2. Wait for the verification email (sent after step 1 started).
    - expect: The subject is "Verify your email for complya.dev".
    - expect: It has a link containing `/app/auth/action?mode=verifyEmail`.
  3. Open `/app/sign-in` and sign in with the new account before opening the link.
    - expect: The URL is still `/app/sign-in`.
    - expect: The toast is "Please verify your email before signing in. Check your inbox for the verification link."
    - expect: "Email not verified." is visible.
  4. Open the verification link.
    - expect: The URL is `/app/email/verified` and the heading is "Email Verified!".
  5. Open the same link again.
    - expect: The URL is `/app/sign-in` and the toast is "This link is invalid. It may have already been used."
  6. Sign in with the new account.
    - expect: The URL is `/app/review-terms` and the heading "Review our terms" is visible (the onboarding page).
