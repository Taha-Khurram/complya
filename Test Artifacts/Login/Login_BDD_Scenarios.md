# Complya Login - BDD Scenarios

| | |
|---|---|
| **Feature** | Login (email and password) |
| **URL tested** | https://app.complya.com/ (redirects to https://app.complya.com/app/sign-in); LG-001 and LG-004 on https://app.complya.dev/app/sign-in with the dev test account |
| **Automation** | `tests/login/lg-00x-*.spec.js` using `pages/loginpage.js` (runs against app.complya.dev by default; set `APP_URL` to change) |
| **Date** | 2026-10-26 |
| **Scope** | In: manual login with email and password, field validation, password masking, Enter to submit. Out: Google/Apple sign-in, sign up, forgot/reset password, Remember me, MFA, security, performance. |
| **Feature file** | `Test artifacts/Login/login.feature` |

All UI text below was observed in a live browser with the Playwright MCP on the date above, unless marked **To be confirmed**.

## Page reference (as observed)

| Element | Observed |
|---|---|
| Page title | "Complya" |
| Heading | "Login" |
| Email field | No visible label. Placeholder "Enter your email address" |
| Password field | No visible label. Placeholder "Enter Password". Masked by default |
| Show/hide toggle | Icon button labelled "Show password", which changes to "Hide password" while the password is visible |
| Submit button | "Sign In". Always enabled, including when both fields are empty |
| Forgot password link | "Forget password", links to `/app/forget-password` (noted only, not tested) |
| Field errors | Inline text under the field |
| Login failure error | Toast (alert with a "close" button and a timer bar) |

## Summary

| ID | Scenario | Priority | Type |
|---|---|---|---|
| LG-001 | Successful login with a valid email and password | High | Positive |
| LG-002 | Required-field validation (3 examples: both empty, email empty, password empty) | High | Validation |
| LG-003 | Invalid email format (2 examples: `user@`, `user.com`) | Medium | Validation |
| LG-004 | Registered email with a wrong password | High | Negative |
| LG-005 | Unregistered email does not reveal whether the account exists | High | Negative |
| LG-006 | Password is masked and the show/hide toggle works | Medium | Positive |
| LG-007 | Pressing Enter submits the login form | Low | Positive |

7 scenarios, 10 test cases once the outline examples are counted.

Test data: `<valid_email>` and `<valid_password>` are a registered test account, supplied from configuration and never written into these files. `<unregistered_email>` is any well-formed address with no account, e.g. `qa.notregistered.<random>@example.com`.

## Scenarios

**Background:** Given I am on the Complya login page (`/app/sign-in`, heading "Login").

### LG-001 Successful login with a valid email and password
- **Given** I am on the Complya login page
- **When** I log in with `<valid_email>` and `<valid_password>`
- **Then** I am taken to the Home page at `/app/`
- **And** I see the heading "Home"

### LG-002 Required-field validation
- **Given** I am on the Complya login page
- **When** I submit the login form with the fields below
- **Then** I see the inline message(s) below, and I stay on the login page

| Case | Email | Password | Expected inline message(s) |
|---|---|---|---|
| Both fields empty | empty | empty | "Email is required" under email and "Password is required" under password |
| Email empty | empty | filled | "Email is required" under email |
| Password empty | filled (valid format) | empty | "Password is required" under password |

### LG-003 Invalid email format
- **Given** I am on the Complya login page
- **When** I enter the email below and any password, and submit
- **Then** I see the inline message "Invalid email address" under the email field
- **And** I stay on the login page

| Email |
|---|
| `user@` |
| `user.com` |

### LG-004 Registered email with a wrong password
- **Given** I am on the Complya login page
- **When** I log in with `<valid_email>` and an incorrect password
- **Then** I see the error toast "Invalid email or password. Please try again."
- **And** I stay on the login page (`/app/sign-in`)

### LG-005 Unregistered email does not reveal whether the account exists
- **Given** I am on the Complya login page
- **When** I log in with `<unregistered_email>` and any password
- **Then** I see the error toast "Invalid email or password. Please try again."
- **And** the message does not say whether an account exists for that email
- **And** I stay on the login page (`/app/sign-in`)
- **And** the email and password fields keep the values I entered

### LG-006 Password is masked and the show/hide toggle works
- **Given** I am on the Complya login page
- **When** I enter a password
- **Then** the password is masked
- **When** I click "Show password"
- **Then** the password is shown as plain text and the toggle reads "Hide password"
- **When** I click "Hide password"
- **Then** the password is masked again and the toggle reads "Show password"
- **And** the password I entered is unchanged

### LG-007 Pressing Enter submits the login form
- **Given** I am on the Complya login page
- **When** I enter `<unregistered_email>` and any password
- **And** I press Enter in the password field
- **Then** the form is submitted and I see the error toast "Invalid email or password. Please try again."

## Observations / To be confirmed

1. **LG-001 landing page: confirmed on dev.** With the dev test account, login lands on `/app/` with the heading "Home" and a time-of-day greeting. The same account is rejected on app.complya.com (`auth/invalid-credential`), so LG-001 is not yet confirmed on production. Logout was not checked; it is not on the landing page itself.
2. **LG-004 message: confirmed on dev and production.** A registered email with a wrong password shows the same toast as an unregistered email, "Invalid email or password. Please try again.", and the email is kept. Firebase returns the generic `auth/invalid-credential` in both cases.
3. **Sign In is never disabled.** The button is enabled on an empty form, and validation runs only on submit.
4. **No visible field labels.** The email and password fields have placeholders only, so their accessible names are the placeholder text.
5. **"Forget password" wording.** The link text reads "Forget password", not "Forgot password". It may be a copy issue. The reset flow is out of scope.
6. **Toast duration.** The error toast auto-dismisses (it has a timer bar) and was still visible after 5 seconds. The exact duration was not measured.
7. **Email field type.** The email input is `type="text"`, so format validation ("Invalid email address") comes from the app, not the browser.
8. Out of scope but seen: a "Remember me" checkbox, "Sign in with Google" and "Sign in with Apple" buttons (the Apple button's icon has alt text "google"), and a "Sign Up" link.
