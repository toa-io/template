Feature: Hello

  Scenario: Getting hello
    When the request is sent:
      """
      GET /hello/ HTTP/1.1
      accept: text/plain
      """
    Then the response is received:
      """
      200 OK
      content-type: text/plain

      Hello!
      """
