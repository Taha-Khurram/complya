# Complya Onboarding - BDD scenarios
# Source: Test Artifacts/Onboarding/Onboarding_BDD_Scenarios.md
# UI text verified live on https://app.complya.dev on 2026-10-31.
# Automated in tests/onboarding/onboarding.spec.js (pages/onboardingpage.js), test plan specs/onboarding-plan.md.
# The scenarios share one new account and run in order, because an account can only move forward through onboarding.
# Every step is done through the UI: only the sign-in page is opened by URL, and progress is checked by signing out and in again.
# Test data (<new_email>, <password>) comes from configuration, never from this file.
# Documentation only: this project has no Cucumber runner.

Feature: Onboarding
  As a new Complya user who has verified my email
  I want to accept the terms and set up my profile, workspace and signature
  So that my workspace can be approved and I can start using Complya

  Background:
    Given a new account that has verified its email and is signed in

  @onboarding @smoke @positive @OB-001
  Scenario: OB-001 New account starts onboarding at Review our terms
    Given the account has not accepted the terms
    When I sign in
    Then I should be taken to "/app/review-terms"
    And I should see the heading "Review our terms"
    And I should see the sections "Terms of Service", "Privacy Policy", "Electronic Signature Disclosure", "AI Disclosure" and "HIPAA Acknowledgement"
    And the "Terms of Service" section should be open
    And all five consent checkboxes should be unchecked
    And the "Continue" button should be disabled

  @onboarding @positive @OB-002
  Scenario Outline: OB-002 Terms sections open one at a time - <section>
    Given I am on Review our terms
    When I open the "<section>" section
    Then only the "<section>" section should be open
    And the section should show <link>

    Examples:
      | section                         | link                                                                    |
      | Terms of Service                | the link "Read the full Terms of Service" to https://complya.com/terms |
      | Privacy Policy                  | the link "Read the full Privacy Policy" to https://complya.com/privacy |
      | Electronic Signature Disclosure | no link                                                                 |
      | AI Disclosure                   | no link                                                                 |
      | HIPAA Acknowledgement           | no link                                                                 |

  @onboarding @smoke @validation @OB-003
  Scenario: OB-003 All five consents are required to continue
    Given I am on Review our terms
    When I check four of the five consent checkboxes
    Then the "Continue" button should be disabled
    When I check the fifth checkbox
    Then the "Continue" button should be enabled
    When I uncheck one checkbox
    Then the "Continue" button should be disabled
    When I click that checkbox's label and click "Continue"
    Then I should see step "1/4" with the heading "Lets get to know you"
    And the Email field should show my email and be disabled

  @onboarding @validation @OB-004
  Scenario Outline: OB-004 Profile step requires first and last name - <case>
    Given I am on step 1/4
    When I submit the profile with first name <first> and last name <last>
    Then I should see the inline message(s) <messages>
    And I should remain on step 1/4

    Examples:
      | case            | first    | last     | messages                                           |
      | both empty      | empty    | empty    | "First name is required" and "Last name is required" |
      | whitespace only | 3 spaces | 3 spaces | "First name is required" and "Last name is required" |
      | last name empty | "Qa"     | empty    | "Last name is required"                            |

  @onboarding @positive @OB-005
  Scenario: OB-005 Profile step saves the name
    Given I am on step 1/4
    When I submit the profile with first name "Qa" and last name "Onboarding"
    Then I should see the toast "Profile created Successfully"
    And I should see step "2/4" with the heading "Create your workspace"
    When I sign out and sign in again
    Then I should be back on step 2/4

  @onboarding @validation @OB-006
  Scenario Outline: OB-006 Company name validation - <case>
    Given I am on step 2/4
    When I submit the company name <name>
    Then I should see the inline message "<message>"
    And I should remain on step 2/4

    Examples:
      | case                  | name     | message                                     |
      | empty                 | empty    | Company name is required                    |
      | whitespace only       | 3 spaces | Company name is required                    |
      | three characters      | "ABC"    | Company name must be at least 4 characters  |
      | two characters padded | " AB "   | Company name must be at least 4 characters  |

  @onboarding @validation @OB-006
  Scenario: OB-006 Company name is limited to 20 characters
    Given I am on step 2/4
    When I type a company name of 36 characters
    Then the Company name field should keep only the first 20 characters

  @onboarding @validation @OB-007
  Scenario: OB-007 Organization terms gate the workspace creation
    Given I am on step 2/4
    When I submit the company name "QA Onboard <6 digits>"
    Then I should see the organization terms with the sections "Master Service Agreement", "Privacy Policy", "Business Associate Agreement" and "Terms of Service"
    And the "Continue" button should be disabled
    When I check only "Send me product updates and news from Complya"
    Then the "Continue" button should be disabled
    When I check the Master Service Agreement agreement
    Then the "Continue" button should be enabled
    When I sign out and sign in again
    Then I should be back on step 2/4 with an empty Company name

  @onboarding @smoke @positive @OB-008
  Scenario: OB-008 Accepting the organization terms creates the workspace
    Given I am on step 2/4
    When I submit the company name "QA Onboard <6 digits>"
    And I accept the organization terms
    Then I should see the toast "WorkSpace Created Successfully!"
    And I should see step "3/4" with the heading "Workspace Setup"
    And the Organization Name field should show the company name and be disabled

  @onboarding @validation @OB-009
  Scenario: OB-009 Workspace Setup requires all mandatory fields
    Given I am on step 3/4
    When I click "Continue" without filling in the form
    Then I should see the inline messages "Phone number is required", "NPI is required", "EIN is required", "Billing email is required", "Address is required", "City is required", "ZIP is required" and "State is required"
    And I should see no message for Fax
    And I should remain on step 3/4

  @onboarding @validation @OB-010
  Scenario Outline: OB-010 Workspace Setup validates formats - <field>
    Given I am on step 3/4
    When I enter "<value>" in "<field>" and click "Continue"
    Then I should see the inline message "<message>" for "<field>"
    And I should remain on step 3/4

    Examples:
      | field                          | value     | message                                         |
      | Phone Number                   | 123       | Phone number must be a valid 10-digit US number |
      | Fax                            | 12        | Fax must be in the format (XXX) XXX-XXXX        |
      | National Provider Identifier   | 123456789 | NPI must be exactly 10 digits                   |
      | Employer Identification Number | 12345     | EIN must be in the format XX-XXXXXXX            |
      | Billing Email                  | billing@  | Billing email must be a valid email             |
      | ZIP Code                       | 123       | ZIP must be in the format 12345 or 12345-6789   |

  @onboarding @validation @OB-010
  Scenario: OB-010 Workspace Setup formats what I type
    Given I am on step 3/4
    When I type "7025550123" in Phone Number, "5551234567" in Fax, "12345678901" in National Provider Identifier, "123456789" in Employer Identification Number and "733011234" in ZIP Code
    Then the fields should show "+1 (702) 555-0123", "(555) 123-4567", "1234567890", "12-3456789" and "73301-1234"

  @onboarding @positive @OB-011
  Scenario: OB-011 Workspace Setup saves valid details
    Given I am on step 3/4
    When I submit valid workspace details
    Then I should see the toast "Save Successfully!"
    And I should see step "4/4" with the heading "Collaborate with your team"

  @onboarding @validation @OB-012
  Scenario: OB-012 Invite step adds and removes emails without sending invites
    Given I am on step 4/4
    When I click "Send invites" with no email added
    Then I should see the toast "Please add atleast one email"
    When I add the invite email "not-an-email"
    Then no invite email should be added
    When I add the invite email "qa.invite.one@example.com"
    Then I should see "qa.invite.one@example.com" added with the role "staff"
    When I open the role menu
    Then I should see the roles "Admin", "Staff", "Manager" and "Clinical"
    When I choose "Admin" and add "qa.invite.two@example.com" twice
    Then I should see "qa.invite.two@example.com" added once with the role "admin"
    When I click "qa.invite.one@example.com"
    Then it should be removed
    When I add the invite email "qa.invite.one@example.com" again
    And I sign out and sign in again
    Then I should be back on step 4/4 with no invite emails added
    And no invites should be sent

  @onboarding @positive @OB-013
  Scenario: OB-013 Skipping invites opens Add your signature
    Given I am on step 4/4
    And my browser time zone is "America/Chicago"
    When I click "Skip for now"
    Then I should be taken to "/app/add-signature"
    And I should see the heading "Add your signature"
    And the Time zone should be "America/Chicago"
    And the "Continue" button should be disabled

  @onboarding @validation @OB-014
  Scenario: OB-014 Signature dialog requires a drawn or typed signature
    Given I am on Add your signature
    When I open the Signature dialog
    Then the "Draw" tab should be selected and "Submit" should be disabled
    When I draw on the canvas
    Then "Submit" should be enabled
    When I click "Reset"
    Then "Submit" should be disabled
    When I type the signature "   "
    Then "Submit" should be disabled
    When I type the signature "Qa Onboarding"
    Then "Submit" should be enabled
    And the Signature Preview should show "Qa Onboarding"
    When I click "Cancel"
    Then the dialog should close
    And the "Continue" button should be disabled

  @onboarding @smoke @positive @OB-015
  Scenario: OB-015 Completing onboarding shows Waiting for Approval
    Given I am on Add your signature
    When I type the signature "Qa Onboarding" and submit it
    And I click "Continue"
    Then I should see the dialog "Waiting for Approval"
    And the dialog should show the workspace name "QA Onboard <6 digits>"
    And the dialog should say "Complya is reviewing this workspace. You can use it as soon as it's approved — the owner gets an email."
    And I should see the buttons "Sign Out" and "Check Again"
