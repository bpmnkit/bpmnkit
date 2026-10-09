# Microsoft 365 email inbound connector — Authentication — Bearer token

Select **Bearer token** in the **Type** dropdown in the **Authentication** section and enter your bearer token value. Use [secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to avoid exposing sensitive credentials.

**Note**
Bearer tokens expire after **60–90 minutes**. The connector cannot refresh them automatically, so you must provide a new valid access token before expiry.

#### Options to obtain an access token

- Via the Graph Explorer:
  1. Visit [developer.microsoft.com/graph/graph-explorer](https://developer.microsoft.com/graph/graph-explorer).
  2. Log in with your Microsoft account.
  3. Click the **Access Token** tab and copy the bearer token.

- Register your app with the Microsoft identity platform and send a POST request to the `/token` identity platform endpoint to acquire an access token:
  - [How to register your app](https://learn.microsoft.com/en-us/graph/auth-register-app-v2)
  - [How to get access on behalf of a user](https://learn.microsoft.com/en-us/graph/auth-v2-user)

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
