# Amazon EventBridge connector — Configure the Amazon EventBridge Webhook connector — Fill properties in the Authorization section

The Amazon EventBridge Webhook connector supports four types of authorization:

- **None (without authorization)**: No authentication is required for the webhook. Anyone can trigger the webhook without any credentials.

- **JWT (JSON Web Token)**: This authorization type requires the following properties to be filled:
  - **JWK URL**: A link to the JSON Web Key (JWK) Set containing the public keys used to verify the JWT signature. [Learn more about JWK](https://datatracker.ietf.org/doc/html/rfc7517).
  - **JWT Role Property Expression** (optional): An expression to extract the roles from the JWT token. These roles will be used to check against the **Required Roles** property. For example, the expression could be:

  ```
  =if admin = true then ["admin"] else roles
  ```

  - **Required Roles** (optional): A list of roles to test JWT roles against. If provided, the webhook will only be triggered if the JWT token contains at least one of the required roles. For example, if the required role is "admin", the property could be:

  ```
  ["admin"]
  ```

- **Basic**: This authorization type requires the following properties to be filled:
  - **Username**: The username to authenticate the webhook.
  - **Password**: The password associated with the provided username.

- **API Key**: This authorization type requires the following properties to be filled:
  - **API Key**: The API key that needs to be provided in the request to authenticate the webhook.
  - **API Key Locator**: A FEEL expression that extracts the API key from the request. This expression is evaluated in the connector Runtime to retrieve the API key from the incoming request. For example, the API Key Locator could be:
  ```
  =split(request.headers.authorization, " ")[2]
  ```
  or
  ```
  request.headers.mycustomapikey
  ```

Select the appropriate authorization type based on your security requirements and fill in the corresponding properties accordingly.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-eventbridge
