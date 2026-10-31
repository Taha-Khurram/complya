# Onboarding Test Plan

## Application Overview

Onboarding of a new, verified account on the Complya web app (`https://app.complya.dev`, override with `APP_URL`). It starts at the first sign-in after email verification (`/app/sign-in`) and ends at the "Waiting for Approval" dialog.

Flow, explored live on 2026-10-31:

1. `/app/review-terms`: h3 "Review our terms" and "Please agree to the terms below to continue." Five accordion buttons: "Terms of Service" (open by default), "Privacy Policy", "Electronic Signature Disclosure", "AI Disclosure", "HIPAA Acknowledgement". Only one is open at a time. Five checkboxes, and **Continue** stays disabled until all five are checked. Before the terms are accepted, `/app/`, `/app/onboarding` and `/app/add-signature` redirect here. Continue sends `PUT /api/users/consents` and opens `/app/onboarding`. Afterwards `/app/review-terms` and `/app/` redirect to `/app/onboarding`.
2. Step 1/4 at `/app/onboarding`: h6 "Lets get to know you", "Profile Picture" (edit button, file input `accept=image/*`), "First name", "Last name" and a disabled "Email" prefilled with the account email. Valid names send `PATCH /api/users/profile` and the toast is "Profile created Successfully".
3. Step 2/4: h4 "Create your workspace" and "Company name" (maxlength 20). A valid name saves nothing yet and shows the organization terms screen.
4. Organization terms (same URL, no step number): h3 "Review our terms", accordions "Master Service Agreement", "Privacy Policy", "Business Associate Agreement", "Terms of Service". One required checkbox and one optional newsletter checkbox. Continue sends `POST /api/workspaces` (201) and the toast is "WorkSpace Created Successfully!".
5. Step 3/4: h4 "Workspace Setup" with a disabled "Organization Name", phone, "Fax", NPI, EIN, billing email, address, city, ZIP and state. Valid data sends `PATCH /api/workspaces/:id` and the toast is "Save Successfully!".
6. Step 4/4: h6 "Collaborate with your team", an invite email box with a role dropdown (Admin, Staff, Manager, Clinical), **Send invites** and **Skip for now**. Skip saves step 5 and opens `/app/add-signature`.
7. `/app/add-signature`: h3 "Add your signature", a signature dialog (Draw and Type tabs) and a "Time zone" combobox. Continue sends `PUT /api/users/signature` and opens the "Waiting for Approval" dialog on the same URL.
8. "Waiting for Approval" dialog: the workspace name, "Complya is reviewing this workspace. You can use it as soon as it's approved — the owner gets an email.", and the buttons "Sign Out" and "Check Again". The suite only asserts this dialog.

Every step saves its progress with `POST /api/users/user-metadata {step:N}`. A reload keeps the current step. There is no Back button on any step. The footer on every step has a "Sign Out" item (a plain `<div>`), and from step 1/4 on it also has the links "Terms" (https://complya.com/terms) and "Privacy" (https://complya.com/privacy).

Page objects: `pages/onboardingpage.js` (one class per screen: `ReviewTermsPage`, `ProfileStepPage`, `WorkspaceStepPage`, `OrganizationTermsPage`, `WorkspaceSetupStepPage`, `InviteTeamStepPage`, `AddSignaturePage`, `SignatureDialog`, `WaitingForApprovalDialog`), `pages/loginpage.js` (`loginToOnboarding(email, password, step)` returns the screen the account resumes at). Account setup: `utils/accounts.js` (`createVerifiedAccount`).
Email helper: `utils/testmail.js`.

### Test data and side effects

- Every onboarding test needs an account at a specific step, and an account can only go forward. So the suite is **one spec file**, `tests/onboarding/onboarding.spec.js`, with `test.describe.configure({ mode: 'serial' })`. The tests run in the order below. If one fails, the later ones are skipped.
- `beforeAll` creates one new verified account: sign up with `generateEmailAddress('onboarding')` and `QaSignup1!`, wait for the verification email (pass `receivedAfter`), and open the verification link. Each run uses **1 testmail.app email** (the free plan allows 100 a month), creates **1 permanent dev account** and leaves **1 pending workspace**.
- Each test signs in with that account in its own `page`, so it gets its own trace and video. Sign-in resumes at the step the account reached. Each test checks its step and then moves the account one step on. Each scenario below says which step the account is on when the test signs in.
- Skip the suite when `TESTMAIL_API_KEY` or `TESTMAIL_NAMESPACE` is not set.
- `baseURL` is `process.env.APP_URL || 'https://app.complya.dev'`. Use `test.use({ timezoneId: 'America/Chicago' })` so the detected time zone is predictable (to be confirmed that the app reads the browser time zone; on the explorer machine it preselected Asia/Karachi, the machine's zone).
- Test data: first name Qa, last name Onboarding; company name `QA Onboard <last 6 digits of Date.now()>` (max 20 characters); phone 7025550123; fax 5551234567; NPI 1234567893; EIN 123456789; billing email billing.qa@example.com; address 1 Test Street; city Austin; ZIP 73301; state TX; invite emails qa.invite.one@example.com and qa.invite.two@example.com (typed only, never sent); typed signature "Qa Onboarding".
- Every step is done through the UI. The only URL a test opens is `/app/sign-in` (and `beforeAll` opens the verification link from the email, as a user would). Signup starts from the sign-in page's **Sign Up** link. The suite never opens onboarding URLs directly and never reloads; progress checks use the footer "Sign Out" and sign in again.
- The suite never clicks "Send invites" with an email added, or "Sign Out" and "Check Again" in the Waiting for Approval dialog.

### Known issues (not asserted)

- A 9-digit phone number ("+1 (702) 123-456") passes validation.
- The invite hint keeps saying "Press enter to add more Staff." after another role is chosen.
- Billing email accepts "user@domain" (no top-level domain).
- Invalid invite emails are ignored without a message, and "Please add atleast one email" has a typo.
- Invite badges are removed by clicking a plain span (no button, no keyboard access), and "Sign Out" in the footer is a plain div.
- Organization terms are not saved on their own: reloading returns to step 2/4 with an empty company name.
- Both terms screens use the heading "Review our terms", and the second has no step number.
- "Lets get to know you" is missing an apostrophe, and the toast copy is inconsistent ("WorkSpace Created Successfully!", "Save Successfully!").
- The phone "Phone Number *" label and the signature "Name" label are not linked to their inputs.
- There is no Back button between steps.

## Test Scenarios

### 1. Onboarding

**Seed:** `tests/seed.spec.js`

#### 1.1. OB-001 New account starts onboarding at Review our terms @onboarding @smoke @positive

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: just verified, never signed in. Sign in at /app/sign-in with the shared account.
    - expect: The URL is /app/review-terms and the h3 "Review our terms" is visible.
    - expect: The text "Please agree to the terms below to continue." is visible.
  2. Check the accordion sections.
    - expect: Five section buttons are visible: "Terms of Service", "Privacy Policy", "Electronic Signature Disclosure", "AI Disclosure", "HIPAA Acknowledgement".
    - expect: "Terms of Service" is expanded and the other four are collapsed.
  3. Check the checkboxes and the button.
    - expect: Five checkboxes are visible and all are unchecked.
    - expect: "Continue" is disabled.

#### 1.2. OB-002 Terms sections open one at a time and link to the full documents @onboarding @positive

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at Review our terms, nothing checked. Sign in and wait for /app/review-terms.
    - expect: "Terms of Service" is open and contains the link "Read the full Terms of Service".
  2. Check the link target.
    - expect: The link points to https://complya.com/terms and has target=_blank. Do not follow it.
  3. Click "Privacy Policy".
    - expect: "Privacy Policy" opens and "Terms of Service" closes.
    - expect: The link "Read the full Privacy Policy" points to https://complya.com/privacy and has target=_blank.
  4. Click "Electronic Signature Disclosure", then "AI Disclosure", then "HIPAA Acknowledgement", one at a time.
    - expect: Only the clicked section is open each time.
    - expect: None of these three has a "Read the full" link.
  5. Click the open section again.
    - expect: It collapses and no section is open.

#### 1.3. OB-003 All five consents are required to continue @onboarding @smoke @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at Review our terms, nothing checked. Sign in and wait for /app/review-terms.
    - expect: "Continue" is disabled.
  2. Check four of the five boxes.
    - expect: "Continue" is still disabled.
  3. Uncheck one of the four.
    - expect: "Continue" is disabled.
  4. Click the label text of an unchecked box (not the box itself), then click it again.
    - expect: The box toggles on, then off.
  5. Check all five: "I have read and agree to the Terms of Service.", "I have read and agree to the Privacy Policy.", "I consent to sign and receive records electronically.", "I understand how Complya uses AI and will review AI-generated content.", "I acknowledge my responsibilities for protecting PHI under HIPAA."
    - expect: "Continue" is enabled.
  6. Click "Continue".
    - expect: The consents are saved (PUT /api/users/consents) and the URL is /app/onboarding.
    - expect: The text "1/4" and the h6 "Lets get to know you" are visible.
    - expect: The "Email" textbox is disabled and shows the account email.

#### 1.4. OB-004 Profile step requires first and last name @onboarding @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 1/4, profile empty. Sign in and wait for /app/onboarding.
    - expect: "1/4" is visible, "Profile Picture" has an edit button, and "Continue" is enabled.
  2. Click "Continue" with both fields empty.
    - expect: "First name is required" and "Last name is required" show as inline .validation-message text.
    - expect: No profile request is sent and the page stays on 1/4.
  3. Enter spaces only in both fields and click "Continue".
    - expect: Both errors still show (whitespace counts as empty).
  4. Fill only "First name" with Qa, clear "Last name", and click "Continue".
    - expect: Only "Last name is required" shows.
  5. Clear "First name", fill "Last name" with Onboarding, and click "Continue".
    - expect: Only "First name is required" shows.
    - expect: No request is sent while an error shows.

#### 1.5. OB-005 Profile step saves the name @onboarding @positive

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 1/4, profile empty. Sign in and wait for /app/onboarding.
    - expect: "1/4" is visible.
  2. Fill "First name" with Qa and "Last name" with Onboarding, then click "Continue".
    - expect: The toast "Profile created Successfully" shows (PATCH /api/users/profile).
    - expect: The text "2/4" and the h4 "Create your workspace" are visible.
  3. Click "Sign Out" in the footer, then sign in again.
    - expect: The sign-in page shows, and after signing in the account is back on step 2/4.

#### 1.6. OB-006 Company name validation @onboarding @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 2/4, company name empty. Sign in and wait for "2/4".
    - expect: The h4 "Create your workspace", "Profile Picture" and the "Company name" textbox are visible.
  2. Click "Continue" with the field empty.
    - expect: "Company name is required" shows.
  3. Enter spaces only and click "Continue".
    - expect: "Company name is required" shows.
  4. Enter "A", then "ABC", then " AB " (with the spaces) and click "Continue" each time.
    - expect: "Company name must be at least 4 characters" shows each time (the value is trimmed, so " AB " counts as 2 characters).
  5. Type a 25-character string into the field.
    - expect: Only the first 20 characters are kept (maxlength 20).
  6. Clear the field and leave it empty for the next test.
    - expect: No request was sent in any of these steps and nothing is saved.

#### 1.7. OB-007 Organization terms gate the workspace creation @onboarding @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 2/4, company name empty. Sign in and wait for "2/4".
    - expect: The "Company name" textbox is visible.
  2. Enter the company name `QA Onboard <last 6 digits of Date.now()>` and click "Continue".
    - expect: The organization terms screen shows with the h3 "Review our terms" and the text "Please agree to the terms below to continue.".
    - expect: No step number shows and nothing is saved yet.
  3. Check the accordions.
    - expect: Four sections: "Master Service Agreement" (open by default), "Privacy Policy", "Business Associate Agreement", "Terms of Service". Only one is open at a time.
    - expect: The links are "Read the full Master Service Agreement" (https://complya.com/msa), the Privacy Policy link (https://complya.com/privacy), the Business Associate Agreement link (https://complya.com/baa) and the Terms of Service link (https://complya.com/terms). Do not follow them.
  4. Check the checkboxes and the button.
    - expect: "I have read and agreed to the Master Service Agreement, Privacy Policy, Business Associate Agreement, and Terms of Service." and "Send me product updates and news from Complya" are both unchecked.
    - expect: "Continue" is disabled.
  5. Check only "Send me product updates and news from Complya".
    - expect: "Continue" is still disabled.
  6. Check the required agreement as well.
    - expect: "Continue" is enabled. Do not click it.
  7. Click "Sign Out" in the footer, then sign in again.
    - expect: The account is back on step 2/4 and "Company name" is empty (nothing was saved).

#### 1.8. OB-008 Accepting the organization terms creates the workspace @onboarding @smoke @positive

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 2/4, company name empty. Sign in and wait for "2/4".
    - expect: "Company name" is empty.
  2. Enter the company name `QA Onboard <last 6 digits of Date.now()>` (keep it for OB-015) and click "Continue".
    - expect: The organization terms screen shows.
  3. Check the required agreement, leave the newsletter box unchecked, and click "Continue".
    - expect: The workspace is created (POST /api/workspaces returns 201).
    - expect: The toast "WorkSpace Created Successfully!" shows.
    - expect: The text "3/4" and the h4 "Workspace Setup" are visible.
    - expect: "Organization Name" is disabled and holds the company name.

#### 1.9. OB-009 Workspace Setup requires all mandatory fields @onboarding @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 3/4, no details saved. Sign in and wait for "3/4".
    - expect: "Organization Name" is disabled and holds the company name.
    - expect: The phone field (`input[name=phoneNumber]`, accessible name is its placeholder "1 (702) 123-4567") is prefilled with "+1".
    - expect: Textboxes "Fax", "National Provider Identifier *", "Employer Identification Number *", "Billing Email *", "Address *", "City *", "ZIP Code *", "State *" and the button "Continue" are visible.
  2. Click "Continue" with only the defaults.
    - expect: Eight errors show: "Phone number is required", "NPI is required", "EIN is required", "Billing email is required", "Address is required", "City is required", "ZIP is required", "State is required".
    - expect: No error shows for "Fax" (it is optional).
    - expect: No request is sent and the page stays on 3/4.

#### 1.10. OB-010 Workspace Setup validates formats and masks input @onboarding @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 3/4, no details saved. Sign in and wait for "3/4".
    - expect: The form holds only the defaults.
  2. Enter bad values: phone "123" (shown as "+1 (123)"), fax "12", NPI "12345", EIN "12345", billing email "billing@", ZIP "123". Click "Continue".
    - expect: "Phone number must be a valid 10-digit US number".
    - expect: "Fax must be in the format (XXX) XXX-XXXX".
    - expect: "NPI must be exactly 10 digits".
    - expect: "EIN must be in the format XX-XXXXXXX".
    - expect: "Billing email must be a valid email".
    - expect: "ZIP must be in the format 12345 or 12345-6789".
    - expect: No request is sent.
  3. Replace NPI with "123456789", billing email with "billing.example.com" and ZIP with "123456", then click "Continue".
    - expect: "NPI must be exactly 10 digits" and "Billing email must be a valid email" still show.
    - expect: "ZIP must be in the format 12345 or 12345-6789" still shows.
  4. Check the masks: phone 7025550123, fax 5551234567, EIN 123456789 (and with letters mixed in), NPI "abcdefghij" and "12345678901", ZIP 123456 and 733011234.
    - expect: Phone shows "+1 (702) 555-0123".
    - expect: Fax shows "(555) 123-4567".
    - expect: EIN shows "12-3456789" and letters are dropped.
    - expect: NPI keeps digits only: "abcdefghij" gives an empty field (then "NPI is required" on submit) and "12345678901" gives "1234567890".
    - expect: ZIP 123456 shows "12345-6" and 733011234 shows "73301-1234".
  5. Enter ZIP 73301, then 73301-1234, and click "Continue" each time.
    - expect: Neither value gives a ZIP error.

#### 1.11. OB-011 Workspace Setup saves valid details @onboarding @positive

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 3/4, no details saved. Sign in and wait for "3/4".
    - expect: The "Workspace Setup" form is visible.
  2. Fill phone 7025550123, fax 5551234567, NPI 1234567893, EIN 123456789, billing email billing.qa@example.com, address 1 Test Street, city Austin, ZIP 73301, state TX.
    - expect: The masked values show as "+1 (702) 555-0123", "(555) 123-4567" and "12-3456789".
  3. Click "Continue".
    - expect: The details are saved (PATCH /api/workspaces/:id, phone sent as +17025550123, fax as "(555) 123-4567").
    - expect: The toast "Save Successfully!" shows.
    - expect: The text "4/4" and the h6 "Collaborate with your team" are visible.

#### 1.12. OB-012 Invite step adds and removes emails without sending invites @onboarding @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 4/4, no invites. Sign in and wait for "4/4".
    - expect: The text "The more your teammates use Complya, the more powerful it becomes." and "Invite people to collaborate in Complya" are visible.
    - expect: The email textbox (placeholder "email@example.com"), the role button (default "Staff"), the hint "Press enter to add more Staff.", "Send invites" and "Skip for now" are visible.
  2. Click "Send invites" with no emails.
    - expect: The toast "Please add atleast one email" shows and no invite is sent.
  3. Type "not-an-email" and press Enter.
    - expect: The text stays in the field, no badge is added and no message shows.
  4. Clear the field, type qa.invite.one@example.com and press Enter.
    - expect: A badge shows the email and the role "staff" (lower case).
    - expect: The field is cleared.
  5. Open the role dropdown.
    - expect: The menu items are Admin, Staff, Manager and Clinical.
  6. Choose "Admin", type qa.invite.two@example.com and press Enter.
    - expect: A second badge shows qa.invite.two@example.com with "admin".
  7. Type qa.invite.one@example.com again and press Enter.
    - expect: Only one badge for qa.invite.one@example.com remains.
  8. Click each badge.
    - expect: Each badge is removed.
  9. Add qa.invite.one@example.com again, click "Sign Out" in the footer, and sign in again.
    - expect: The account is back on 4/4 and the badge is gone. Do not click "Send invites".

#### 1.13. OB-013 Skipping invites opens Add your signature @onboarding @positive

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at step 4/4, no invites. Sign in and wait for "4/4".
    - expect: "Skip for now" is visible.
  2. Click "Skip for now".
    - expect: The URL is /app/add-signature (no invites sent; step 5 is saved).
    - expect: The h3 "Add your signature" is visible with the text "Draw or type your signature. It is used when you sign session notes, and you can change it later under Signature in your Staff Details. We detected your time zone below; change it if it is not right."
    - expect: The button "Add signature" (text "Click to draw or type your signature") is visible.
    - expect: "Continue" is disabled.
    - expect: The "Time zone" combobox value is "America/Chicago" (to be confirmed that the app reads the browser time zone). Check the value, not the label: the label's UTC offset changes with daylight saving time.
    - expect: Signing in again at this point resumes at /app/add-signature (to be confirmed; OB-014 and OB-015 depend on it).

#### 1.14. OB-014 Signature dialog requires a drawn or typed signature @onboarding @validation

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at Add your signature, no signature saved. Sign in and wait for /app/add-signature.
    - expect: "Continue" is disabled.
  2. Click "Add signature".
    - expect: A dialog titled "Signature" opens with a "Close" button, the tabs "Draw" (selected, with a canvas) and "Type", and the buttons "Cancel", "Reset" and "Submit".
    - expect: "Submit" is disabled.
  3. Draw a stroke on the canvas.
    - expect: "Submit" is enabled.
  4. Click "Reset".
    - expect: The canvas is cleared and "Submit" is disabled.
  5. Open the "Type" tab.
    - expect: The textbox with the placeholder "Type your signature" (maxlength 100) and "Signature Preview" are visible.
    - expect: The preview shows the text in several fonts, with Marck Script selected by default.
  6. Type spaces only.
    - expect: "Submit" stays disabled.
  7. Type "Qa Onboarding".
    - expect: "Submit" is enabled and the preview shows the text.
  8. Click "Reset".
    - expect: The text is cleared and "Submit" is disabled.
  9. Click "Cancel". Then reopen with "Add signature" and click "Close".
    - expect: The dialog closes each time and "Continue" stays disabled.

#### 1.15. OB-015 Completing onboarding shows Waiting for Approval @onboarding @smoke @positive

**File:** `tests/onboarding/onboarding.spec.js`

**Steps:**
  1. Account state: at Add your signature, no signature saved. Sign in and wait for /app/add-signature.
    - expect: "Continue" is disabled.
  2. Click "Add signature", open the "Type" tab, type "Qa Onboarding" and click "Submit".
    - expect: The dialog closes and "Continue" is enabled (nothing is saved yet).
    - expect: The button "Edit signature" is visible and opens the dialog again.
  3. Leave the "Time zone" unchanged and click "Continue".
    - expect: The signature is saved (PUT /api/users/signature with {"signature":"Qa Onboarding|Marck Script","timezone":"America/Chicago"}).
    - expect: A dialog opens on the same URL.
  4. Check the dialog. Do not click its buttons. The test ends here.
    - expect: The h2 "Waiting for Approval" is visible.
    - expect: The workspace name (the `QA Onboard <digits>` company name) is visible.
    - expect: The text "Complya is reviewing this workspace. You can use it as soon as it's approved — the owner gets an email." is visible.
    - expect: The buttons "Sign Out" and "Check Again" are visible.
