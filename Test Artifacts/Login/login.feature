# Complya Login - BDD scenarios
# Source: Test artifacts/Login/Login_BDD_Scenarios.md
# UI text verified live on https://app.complya.com/app/sign-in on 2026-10-26.
# LG-001 and LG-004 verified on https://app.complya.dev with the dev test account (USER_EMAIL / USER_PASSWORD).
# Automated in tests/login/ (pages/loginpage.js).
# Test data (<valid_email>, <valid_password>, <unregistered_email>) comes from configuration, never from this file.
# Documentation only: this project has no Cucumber runner.

Feature: Login
  As a registered Complya user
  I want to log in with my email and password
  So that I can access my Complya account

  Background:
    Given I am on the Complya login page

  @login @smoke @positive @LG-001
  Scenario: LG-001 Successful login with a valid email and password
    When I log in with a valid email and password
    Then I should be taken to the Home page at "/app/"
    And I should see the heading "Home"

  @login @smoke @validation @LG-002
  Scenario Outline: LG-002 Required-field validation - <case>
    Given the email field is <email_state>
    And the password field is <password_state>
    When I submit the login form
    Then I should see the inline validation message(s) <messages>
    And I should remain on the login page

    Examples:
      | case              | email_state | password_state | messages                                       |
      | both fields empty | empty       | empty          | "Email is required" and "Password is required" |
      | email empty       | empty       | filled         | "Email is required"                            |
      | password empty    | filled      | empty          | "Password is required"                         |

  @login @validation @LG-003
  Scenario Outline: LG-003 Invalid email format - <invalid_email>
    When I log in with the email "<invalid_email>" and any password
    Then I should see the inline message "Invalid email address" under the email field
    And I should remain on the login page

    Examples:
      | invalid_email |
      | user@         |
      | user.com      |

  @login @smoke @negative @LG-004
  Scenario: LG-004 Registered email with a wrong password
    When I log in with a valid email and an incorrect password
    Then I should see the error toast "Invalid email or password. Please try again."
    And I should remain on the login page

  @login @negative @LG-005
  Scenario: LG-005 Unregistered email does not reveal whether the account exists
    When I log in with an unregistered email and any password
    Then I should see the error toast "Invalid email or password. Please try again."
    And the message should not say whether an account exists for that email
    And I should remain on the login page
    And the email and password fields should keep the values I entered

  @login @positive @LG-006
  Scenario: LG-006 Password is masked and the show/hide toggle works
    When I enter a password
    Then the password should be masked
    When I choose to show the password
    Then the password should be shown as plain text
    And the toggle should read "Hide password"
    When I choose to hide the password
    Then the password should be masked
    And the toggle should read "Show password"
    And the password I entered should be unchanged

  @login @positive @LG-007
  Scenario: LG-007 Pressing Enter submits the login form
    When I enter an unregistered email and any password
    And I press Enter in the password field
    Then the login form should be submitted
    And I should see the error toast "Invalid email or password. Please try again."
