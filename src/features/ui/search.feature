@ui
Feature: Sauce Demo shopping
  As a shopper
  I want to inspect and purchase demo products
  So that the core shopping journey is validated without a real payment

  Scenario: Verify product listing
    Given I am logged in to the store
    Then the product listing should be displayed

  Scenario: Add product to cart and verify its contents
    Given I am logged in to the store
    When I add the configured demo product to the cart
    And I open the shopping cart
    Then the cart should contain the configured demo product

  Scenario: Complete the demo checkout
    Given I am logged in to the store
    When I add the configured demo product to the cart
    And I open the shopping cart
    And I complete checkout with generated customer details
    Then the order confirmation should be displayed
