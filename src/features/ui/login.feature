@ui
Feature: Sauce Demo authentication
  As a test engineer
  I want to validate store authentication
  So that login behavior is covered through the browser

  Scenario: Successful login
    Given I open the Sauce Demo login page
    When I log in with valid credentials
    Then the store inventory should be visible

  @negative
  Scenario: Invalid login
    Given I open the Sauce Demo login page
    When I log in with invalid credentials
    Then the invalid login message should be visible
