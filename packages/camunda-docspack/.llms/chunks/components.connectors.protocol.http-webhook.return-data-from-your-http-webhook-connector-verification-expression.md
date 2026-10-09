# HTTP Webhook connector — Return data from your HTTP Webhook connector — Verification expression

The verification expression allows you to return a custom HTTP response without triggering process correlation. This feature supports multiple scenarios beyond one-time verification challenges, including:

- **One-time verification challenges**: Respond to webhook provider verification requests (e.g., Slack, GitHub).
- **Request validation**: Reject invalid or malformed requests before a process instance is created.
- **Conditional responses**: Return different responses based on request content.

#### How it works

When the verification expression evaluates to a **non-null** value:

1. The webhook returns the specified response immediately.
2. Process correlation does not occur.
3. Activation conditions, HMAC validation, and the rest of the webhook pipeline are skipped.

When the verification expression evaluates to **null**:

1. The webhook continues with normal processing.
2. Activation conditions are evaluated.
3. HMAC validation (if configured) is performed.
4. Process correlation proceeds as usual.

#### Response format

Use the following references to access incoming request data:

- Body: `request.body.`
- Headers: `request.headers.`
- URL parameters: `request.params.`

To construct a response, use these fields in the returned object:

- **`body`** – for example:  
  `{"body": {"challenge": request.body.challenge}}`
- **`statusCode`** – for example:  
  `{"statusCode": 201, "body": {"result": "ok"}}`  
  If omitted, the default status code is **200**.
- **`headers`** – for example:  
  `{"headers": {"Content-Type": "application/json"}, "body": {"result": "ok"}}`

Use FEEL expressions to build and transform the response content as needed.

#### Example: One-time verification challenge

A common use-case is a [one-time verification challenge](https://webhooks.fyi/security/one-time-verification-challenge).

For example, consider the following verification challenge from [Slack](https://slack.com/):

```json
{
  "token": "Jhj5dZrVaK7ZwHHjRyZWjbDl",
  "challenge": "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
  "type": "url_verification"
}
```

To confirm the Slack events subscription, you must return the following response:

```
HTTP 200 OK
Content-type: application/json
{"challenge":"3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P"}
```

To do so, the **Verification expression** field may look like:

```feel
=if request.body.type = "url_verification"
then {"body": {"challenge": request.body.challenge}, "statusCode": 200}
else null
```

#### Example: Request validation

You can validate incoming requests and reject invalid payloads before creating a process instance:

```feel
=if request.body.requiredField = null
then {"body": {"error": "Missing required field"}, "statusCode": 400}
else null
```

This expression checks if `requiredField` is missing and returns a `400 Bad Request` status with an error message. If the field is present, it returns `null`, allowing normal webhook processing to continue.

#### Example: Custom status codes

You can return any HTTP status code, including non-standard or conflict codes:

```feel
=if request.body.challenge != null
then {"body": {"challenge": request.body.challenge}, "statusCode": 409}
else null
```

#### Example: Custom headers

You can include custom headers in your response:

```feel
=if request.body.challenge != null
then {
  "body": {"challenge": request.body.challenge},
  "headers": {"Content-Type": "application/camunda-bin"}
}
else null
```

#### Example: Nested body structure

You can access and respond to nested data structures in the request:

```feel
=if request.body.event_type = "verification"
then {"body": {"challenge": request.body.event.challenge}}
else null
```

This example extracts the challenge from a nested `event` object and returns it in the response.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
