# Complya Onboarding - BDD Scenarios

| | |
|---|---|
| **Feature** | Onboarding of a new self-serve account, from the first sign-in to "Waiting for Approval" |
| **URL tested** | https://app.complya.dev/app/review-terms, /app/onboarding, /app/add-signature |
| **Automation** | `tests/onboarding/onboarding.spec.js` using `pages/onboardingpage.js` (runs against app.complya.dev by default; set `APP_URL` to change) |
| **Test plan** | `specs/onboarding-plan.md` |
| **Date** | 2026-10-31 |
| **Scope** | In: user terms, profile (1/4), workspace name (2/4), organization terms, workspace setup (3/4), team invites (4/4, without sending), signature and time zone, the "Waiting for Approval" dialog. Out: sending invites, profile picture upload, workspace approval, "Check Again" and "Sign Out" in the final dialog, the footer "Sign Out", performance, security. |
| **Feature file** | `Test Artifacts/Onboarding/onboarding.feature` |

All UI text below was observed in a live browser with the Playwright MCP on the date above, unless marked **To be confirmed**. App typos are quoted as they appear.

## Page reference (as observed)

| Screen | URL | Heading | Elements |
|---|---|---|---|
| Review our terms | `/app/review-terms` | "Review our terms" | Five accordions: Terms of Service (open by default), Privacy Policy, Electronic Signature Disclosure, AI Disclosure, HIPAA Acknowledgement. Five checkboxes. "Continue" disabled until all five are checked |
| Step 1/4 | `/app/onboarding` | "Lets get to know you" | Profile Picture, First name, Last name, Email (disabled, prefilled), "Continue" |
| Step 2/4 | `/app/onboarding` | "Create your workspace" | Profile Picture, Company name (max 20 characters), "Continue" |
| Organization terms | `/app/onboarding` (no step number) | "Review our terms" | Accordions: Master Service Agreement, Privacy Policy, Business Associate Agreement, Terms of Service. One required checkbox, one optional newsletter checkbox. "Continue" disabled until the required one is checked |
| Step 3/4 | `/app/onboarding` | "Workspace Setup" | Organization Name (disabled, prefilled), Phone Number (prefilled "+1"), Fax (optional), National Provider Identifier, Employer Identification Number, Billing Email, Address, City, ZIP Code, State, "Continue" |
| Step 4/4 | `/app/onboarding` | "Collaborate with your team" | Email field, role menu (Admin, Staff, Manager, Clinical; default Staff), "Send invites", "Skip for now" |
| Add your signature | `/app/add-signature` | "Add your signature" | "Add signature" and "Edit signature" open the Signature dialog. Time zone select, preselected from the browser. "Continue" disabled until a signature is submitted |
| Signature dialog | (dialog) | "Signature" | Tabs "Draw" (canvas) and "Type" (text field and font preview). "Close", "Cancel", "Reset", "Submit" (disabled until drawn or typed) |
| Waiting for Approval | `/app/add-signature` (dialog) | "Waiting for Approval" | Workspace name, "Complya is reviewing this workspace. You can use it as soon as it's approved — the owner gets an email.", "Sign Out", "Check Again" |

Every step has a "Sign Out" item in the footer, and there is no Back button. Progress is saved after each step, so signing in again or reloading resumes at the current step. The organization terms are the exception: they are saved together with the workspace.

## Summary

| ID | Scenario | Priority | Type |
|---|---|---|---|
| OB-001 | New account starts onboarding at Review our terms | High | Positive |
| OB-002 | Terms sections open one at a time and link to the full documents (5 examples) | Low | Positive |
| OB-003 | All five consents are required to continue | High | Validation |
| OB-004 | Profile step requires first and last name (3 examples) | Medium | Validation |
| OB-005 | Profile step saves the name | High | Positive |
| OB-006 | Company name validation (4 examples, plus the 20-character limit) | Medium | Validation |
| OB-007 | Organization terms gate the workspace creation | Medium | Validation |
| OB-008 | Accepting the organization terms creates the workspace | High | Positive |
| OB-009 | Workspace Setup requires all mandatory fields | Medium | Validation |
| OB-010 | Workspace Setup validates formats and masks input (6 examples, plus the input masks) | Medium | Validation |
| OB-011 | Workspace Setup saves valid details | High | Positive |
| OB-012 | Invite step adds and removes emails without sending invites | Medium | Validation |
| OB-013 | Skipping invites opens Add your signature | High | Positive |
| OB-014 | Signature dialog requires a drawn or typed signature | Medium | Validation |
| OB-015 | Completing onboarding shows Waiting for Approval | High | Positive |

15 scenarios, 31 test cases in `onboarding.feature` once the outline examples are counted.

**Test data and side effects.** The scenarios run in order on one new account, because an account can only move forward through onboarding. Each run signs up one account (`<new_email>`, a testmail.app address, with `<password>`), which uses one testmail.app email (100 a month on the free plan) and leaves one permanent dev account and one pending workspace. Values used: name Qa / Onboarding, company `QA Onboard <6 digits>`, phone 7025550123, fax 5551234567, NPI 1234567893, EIN 123456789, billing email billing.qa@example.com, address 1 Test Street, city Austin, ZIP 73301, state TX, typed signature "Qa Onboarding". Invite emails are only typed, never sent.

## Scenarios

**Background:** Given a new account that has verified its email and is signed in, and the account has reached the step named in the scenario.

### OB-001 New account starts onboarding at Review our terms
- **Given** the account has not accepted the terms
- **When** I open `/app/` or `/app/onboarding`
- **Then** I am redirected to `/app/review-terms`
- **And** I see the heading "Review our terms" and "Please agree to the terms below to continue."
- **And** I see the five sections, with "Terms of Service" open
- **And** all five checkboxes are unchecked and "Continue" is disabled

### OB-002 Terms sections open one at a time and link to the full documents
- **Given** I am on Review our terms
- **When** I open each section in turn
- **Then** only that section is open
- **And** the section shows the link below, or no link

| Section | Link |
|---|---|
| Terms of Service | "Read the full Terms of Service" → https://complya.com/terms (new tab) |
| Privacy Policy | "Read the full Privacy Policy" → https://complya.com/privacy (new tab) |
| Electronic Signature Disclosure | none |
| AI Disclosure | none |
| HIPAA Acknowledgement | none |

- **When** I click the open section's header again
- **Then** no section is open

### OB-003 All five consents are required to continue
- **Given** I am on Review our terms
- **When** I check four of the five boxes
- **Then** "Continue" is disabled
- **When** I check the fifth box
- **Then** "Continue" is enabled
- **When** I uncheck one box
- **Then** "Continue" is disabled again
- **When** I click that box's label text and click "Continue"
- **Then** I see step "1/4" "Lets get to know you" at `/app/onboarding`
- **And** the Email field shows `<new_email>` and is disabled
- **And** opening `/app/review-terms` now takes me back to `/app/onboarding`

### OB-004 Profile step requires first and last name
- **Given** I am on step 1/4
- **When** I submit with the names below
- **Then** I see the inline message(s) below, and I stay on step 1/4

| Case | First name | Last name | Expected inline message(s) |
|---|---|---|---|
| Both empty | empty | empty | "First name is required" and "Last name is required" |
| Whitespace only | 3 spaces | 3 spaces | "First name is required" and "Last name is required" |
| Last name empty | Qa | empty | "Last name is required" |

### OB-005 Profile step saves the name
- **Given** I am on step 1/4
- **When** I enter "Qa" and "Onboarding" and click "Continue"
- **Then** I see the toast "Profile created Successfully"
- **And** I see step "2/4" "Create your workspace"

### OB-006 Company name validation
- **Given** I am on step 2/4
- **When** I submit the company name below
- **Then** I see the inline message below, and I stay on step 2/4

| Company name | Expected inline message |
|---|---|
| empty | "Company name is required" |
| 3 spaces | "Company name is required" |
| `ABC` | "Company name must be at least 4 characters" |
| ` AB ` (spaces around) | "Company name must be at least 4 characters" |

- **When** I type a 36-character name
- **Then** the field keeps only the first 20 characters

### OB-007 Organization terms gate the workspace creation
- **Given** I am on step 2/4
- **When** I enter `QA Onboard <6 digits>` and click "Continue"
- **Then** I see a second "Review our terms" screen with the sections Master Service Agreement (open), Privacy Policy, Business Associate Agreement and Terms of Service
- **And** each section links to https://complya.com/msa, /privacy, /baa and /terms
- **And** both checkboxes are unchecked and "Continue" is disabled
- **When** I check only "Send me product updates and news from Complya"
- **Then** "Continue" is still disabled
- **When** I check "I have read and agreed to the Master Service Agreement, Privacy Policy, Business Associate Agreement, and Terms of Service."
- **Then** "Continue" is enabled
- **When** I reload the page
- **Then** I am back on step 2/4 and the Company name field is empty

### OB-008 Accepting the organization terms creates the workspace
- **Given** I am on step 2/4
- **When** I enter `QA Onboard <6 digits>`, click "Continue", check the required agreement and click "Continue"
- **Then** I see the toast "WorkSpace Created Successfully!"
- **And** I see step "3/4" "Workspace Setup"
- **And** Organization Name shows the company name and is disabled

### OB-009 Workspace Setup requires all mandatory fields
- **Given** I am on step 3/4 with the fields as they load (phone "+1", the rest empty)
- **When** I click "Continue"
- **Then** I see "Phone number is required", "NPI is required", "EIN is required", "Billing email is required", "Address is required", "City is required", "ZIP is required" and "State is required"
- **And** I see no message for Fax
- **And** I stay on step 3/4

### OB-010 Workspace Setup validates formats and masks input
- **Given** I am on step 3/4
- **When** I enter the value below in the field and click "Continue"
- **Then** I see the inline message below for that field, and I stay on step 3/4

| Field | Value | Expected inline message |
|---|---|---|
| Phone Number | `123` | "Phone number must be a valid 10-digit US number" |
| Fax | `12` | "Fax must be in the format (XXX) XXX-XXXX" |
| National Provider Identifier | `123456789` | "NPI must be exactly 10 digits" |
| Employer Identification Number | `12345` | "EIN must be in the format XX-XXXXXXX" |
| Billing Email | `billing@` | "Billing email must be a valid email" |
| ZIP Code | `123` | "ZIP must be in the format 12345 or 12345-6789" |

- **And** the fields format what I type:

| Field | Typed | Shown |
|---|---|---|
| Phone Number | `7025550123` | `+1 (702) 555-0123` |
| Fax | `5551234567` | `(555) 123-4567` |
| National Provider Identifier | `12345678901` | `1234567890` |
| Employer Identification Number | `123456789` | `12-3456789` |
| ZIP Code | `733011234` | `73301-1234` |

### OB-011 Workspace Setup saves valid details
- **Given** I am on step 3/4
- **When** I enter the valid workspace details from the test data and click "Continue"
- **Then** I see the toast "Save Successfully!"
- **And** I see step "4/4" "Collaborate with your team"

### OB-012 Invite step adds and removes emails without sending invites
- **Given** I am on step 4/4
- **When** I click "Send invites" with no email added
- **Then** I see the toast "Please add atleast one email"
- **When** I type `not-an-email` and press Enter
- **Then** no email is added and the text stays in the field
- **When** I type `qa.invite.one@example.com` and press Enter
- **Then** I see it added with the role "staff", and the field is cleared
- **When** I open the role menu
- **Then** I see Admin, Staff, Manager and Clinical
- **When** I choose Admin and add `qa.invite.two@example.com` twice
- **Then** I see it added once, with the role "admin"
- **When** I click the first added email
- **Then** it is removed
- **And** no invites are sent

### OB-013 Skipping invites opens Add your signature
- **Given** I am on step 4/4 and my browser time zone is America/Chicago
- **When** I click "Skip for now"
- **Then** I am taken to `/app/add-signature` with the heading "Add your signature"
- **And** the Time zone value is `America/Chicago` (**To be confirmed** that the app reads the browser time zone). Check the value, not the label: the label's UTC offset changes with daylight saving time
- **And** "Continue" is disabled

### OB-014 Signature dialog requires a drawn or typed signature
- **Given** I am on Add your signature
- **When** I click "Add signature"
- **Then** I see the Signature dialog on the "Draw" tab, and "Submit" is disabled
- **When** I draw on the canvas
- **Then** "Submit" is enabled
- **When** I click "Reset"
- **Then** "Submit" is disabled
- **When** I choose "Type" and enter 3 spaces
- **Then** "Submit" is disabled
- **When** I enter "Qa Onboarding"
- **Then** "Submit" is enabled and the Signature Preview shows "Qa Onboarding"
- **When** I click "Cancel"
- **Then** the dialog closes and "Continue" is still disabled
- **When** I click "Edit signature" and then "Close"
- **Then** the dialog closes and "Continue" is still disabled

### OB-015 Completing onboarding shows Waiting for Approval
- **Given** I am on Add your signature
- **When** I type the signature "Qa Onboarding", click "Submit" and click "Continue"
- **Then** I see the dialog "Waiting for Approval"
- **And** it shows the workspace name `QA Onboard <6 digits>`
- **And** it says "Complya is reviewing this workspace. You can use it as soon as it's approved — the owner gets an email."
- **And** I see the buttons "Sign Out" and "Check Again"

## Observations / To be confirmed

1. **One account per run.** An account can only move forward, so the scenarios share one account and run in order. If one fails, the later ones cannot run.
2. **9-digit phone number accepted.** "+1 (702) 123-456" passes validation. Not asserted.
3. **Invite role hint.** After choosing another role, the hint still reads "Press enter to add more Staff." Not asserted.
4. **Billing email.** "user@domain" (no top-level domain) is accepted. Not asserted.
5. **Silent invite errors.** An invalid invite email is ignored without a message. The empty-list toast reads "Please add atleast one email" (typo).
6. **Keyboard access.** Invite emails are removed by clicking plain text, and the footer "Sign Out" is plain text. Neither is a button or link.
7. **Organization terms are not saved on their own.** Reloading the organization terms screen returns to step 2/4 with an empty company name. The workspace is created only when they are accepted.
8. **Two screens named "Review our terms".** The user terms and the organization terms use the same heading, and the second has no step number.
9. **Labels.** The "Phone Number *" label and the signature "Name" label are not linked to their fields.
10. **Copy.** "Lets get to know you" is missing an apostrophe. Toasts read "WorkSpace Created Successfully!" and "Save Successfully!".
11. **No Back button** between steps.
12. **Time zone.** On the exploration machine the select was preselected with the machine's zone (Asia/Karachi). OB-013 assumes the app reads the browser time zone. **To be confirmed** when the test first runs.
13. **Signing in at Add your signature.** Resuming at `/app/add-signature` after "Skip for now" is expected from the saved step but was not observed. **To be confirmed** when the test first runs.
