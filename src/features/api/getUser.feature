@api
Feature: Read user and post resources
  Scenario: Get users
    Given the API service is ready
    When I send a GET request to "/users"
    Then the API response status should be 200
    And the response body should be a non-empty JSON array
    And the response should contain a user with an email address
    And the API response time should be within the configured limit

  Scenario: Get a specific user
    Given the API service is ready
    When I send a GET request to "/users/1"
    Then the API response status should be 200
    And the response should match the user JSON schema
    And the API response time should be within the configured limit

  Scenario: Get a post
    Given the API service is ready
    When I send a GET request to "/posts/1"
    Then the API response status should be 200
    And the response should match the post JSON schema
