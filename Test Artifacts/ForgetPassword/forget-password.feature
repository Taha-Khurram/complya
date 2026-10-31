# Complya Forget Password - BDD scenarios
# Source: Test Artifacts/ForgetPassword/ForgetPassword_BDD_Scenarios.md
# Test plan: specs/forget-password-plan.md
# UI text verified live on https://app.complya.dev on 2026-10-31.
# Automated in tests/forget-password/ (pages/forgetpasswordpage.js). FP-006a to FP-006e run as one test (FP-006) on a single reset email.
# Test data (<account_email>, <current_password>, <new_password>, <unregistered_email>) comes from configuration, never from this file.
# <account_email> is the "QA Onboard 984491" onboarding account. The .env login account (USER_EMAIL) is never used here.
# Documentation only: this project has no Cucumber runner.

Feature: Forget password
  As a registered Complya user who has forgotten my password
  I want to reset it from a link sent to my email
  So that I can sign in to my Complya account again

  Background:
    Given I am on the Complya login page

  @forget-password @smoke @positive @FP-001
  Scenario: FP-001 Forget password link opens the form
    When I click "Forget password"
    Then I should be taken to "/app/forget-password"
    And I should see the heading "Forget Password"
    And the email field should be empty
    And the "Send Email" button should be enabled
    When I go back in the browser
    Then I should be on the login page

  @forget-password @validation @FP-002
  Scenario: FP-002 Empty email is blocked
    Given I am on the Forget Password page
    When I click "Send Email" with the email field empty
    Then the browser should show "Please fill out this field."
    And no reset request should be sent
    And I should remain on "/app/forget-password"

  @forget-password @validation @negative @FP-003
  Scenario Outline: FP-003 Invalid email format - <email>
    Given I am on the Forget Password page
    When I request a reset for "<email>"
    Then I should see the <shown_as> message "<message>"
    And I should remain on "/app/forget-password"

    Examples:
      | email       | shown_as           | message                                                                     |
      | user.com    | browser validation | Please include an '@' in the email address. 'user.com' is missing an '@'. |
      | user@domain | form alert         | Please enter a valid email address.                                         |

  @forget-password @negative @FP-004
  Scenario: FP-004 Unregistered email
    Given I am on the Forget Password page
    When I request a reset for an unregistered email
    Then no email should be delivered to that address
    And I should not be signed in
    And I should see either the "Check your email" screen or the form alert "Failed to send reset email. Please try again."

  @forget-password @negative @FP-005
  Scenario Outline: FP-005 Invalid or missing reset code - <case>
    When I open "<url>"
    Then I should be taken to "/app/forget-password"
    And I should see the error toast "<toast>"

    Examples:
      | case         | url                               | toast                                                   |
      | made-up code | /app/reset-password?oobCode=bogus | This reset link is invalid or has already been used.    |
      | no code      | /app/reset-password               | Invalid password reset link. Please request a new one. |

  @forget-password @smoke @positive @email @FP-006
  Scenario: FP-006a Registered email gets the reset email
    Given I am on the Forget Password page
    When I request a reset for my account email
    Then I should see the heading "Check your email"
    And I should see "We sent a password reset link to your email"
    And I should remain on "/app/forget-password"
    And I should receive an email from "noreply@complya.dev" with the subject "Reset your password for complya.dev"
    And the email should have one link to "/app/auth/action?mode=resetPassword"

  @forget-password @positive @email @FP-006
  Scenario: FP-006b Reset page shows the account and the password rules
    Given I have a reset email for my account
    When I open the link in the email
    Then I should be taken to "/app/reset-password"
    And I should see the heading "Reset Password"
    And I should see "for" followed by my account email
    And the new password and confirm password fields should be empty and masked
    And I should see the hints "Must contain 1 special character" and "Must be at least 8 characters"
    When I type a new password that meets both rules
    Then I should see the hints "Password contains a special character" and "Password has at least 8 characters"
    When I choose to show the new password
    Then the new password should be shown as plain text
    And its toggle should read "Hide password"
    And the confirm password should still be masked

  @forget-password @validation @email @FP-006
  Scenario Outline: FP-006c Reset page password validation - <case>
    Given I am on the Reset Password page from a valid link
    When I enter "<new_password>" as the new password and "<confirm_password>" as the confirmation
    And I click "Reset Password"
    Then I should see the <shown_as> message "<message>"
    And my password should not be changed
    And I should remain on "/app/reset-password"

    Examples:
      | case                 | new_password | confirm_password | shown_as           | message                          |
      | both empty           |              |                  | browser validation | Please fill out this field.      |
      | no special character | abcdefgh     | abcdefgh         | error toast        | Must contain 1 special character |
      | too short            | abc!         | abc!             | error toast        | Must be at least 8 characters    |
      | passwords differ     | QaValid1!    | Different1!      | error toast        | Passwords do not match           |

  @forget-password @smoke @positive @email @FP-006
  Scenario: FP-006d Reset with a valid password, then sign in
    Given I am on the Reset Password page from a valid link
    When I enter my new password in both fields and click "Reset Password"
    Then I should see the success toast "Password reset successfully! You can now sign in with your new password."
    And I should be taken to the login page
    When I log in with my account email and my old password
    Then I should see the error toast "Invalid email or password. Please try again."
    When I log in with my account email and my new password
    Then I should be taken to the Home page at "/app/"

  @forget-password @negative @email @FP-006
  Scenario: FP-006e A used reset link can't be opened again
    Given I have reset my password with the link in the email
    And I am signed out
    When I open the same link again
    Then I should be taken to the login page
    And I should see the error toast "This link is invalid. It may have already been used."
