# Authentication

Learn about access tokens and client credentials and scopes to get started with the Administration API.

All Administration API requests require authentication. To authenticate, generate a [JSON Web Token (JWT)](https://jwt.io/introduction/) and include it in each request.


## Generate a token

1. In Camunda Hub, in the left navigation, click **Organization > Manage organization**.
2. In the **Administration API** tab, click **Create new credentials**.
3. Name the client, and add permissions to this client for [the needed scopes](#client-credentials-and-scopes).
4. Click **Create**.
5. Once you have created the client, capture the following values required to generate a token:
   <!-- this comment convinces the markdown processor to still treat the table as a table, but without adding surrounding paragraphs. 🤷 -->
   | Name                     | Environment variable name        | Default value                                |
   | ------------------------ | -------------------------------- | -------------------------------------------- |
   | Client ID                | `CAMUNDA_CONSOLE_CLIENT_ID`      | -                                            |
   | Client Secret            | `CAMUNDA_CONSOLE_CLIENT_SECRET`  | -                                            |
   | Authorization Server URL | `CAMUNDA_OAUTH_URL`              | `https://login.cloud.camunda.io/oauth/token` |
   | Audience                 | `CAMUNDA_CONSOLE_OAUTH_AUDIENCE` | `api.cloud.camunda.io`                       |
   <!-- this comment convinces the markdown processor to still treat the table as a table, but without adding surrounding paragraphs. 🤷 -->
**Caution**
   When client credentials are created, the `Client Secret` is only shown once. Save this `Client Secret` somewhere safe.
6. Execute an authentication request to the token issuer:
   ```bash
   curl --request POST ${CAMUNDA_OAUTH_URL} \
       --header 'Content-Type: application/x-www-form-urlencoded' \
       --data-urlencode 'grant_type=client_credentials' \
       --data-urlencode "audience=${CAMUNDA_CONSOLE_OAUTH_AUDIENCE}" \
       --data-urlencode "client_id=${CAMUNDA_CONSOLE_CLIENT_ID}" \
       --data-urlencode "client_secret=${CAMUNDA_CONSOLE_CLIENT_SECRET}"
   ```
   A successful authentication response looks like the following:
   ```json
   {
     "access_token": "<TOKEN>",
     "expires_in": 300,
     "refresh_expires_in": 0,
     "token_type": "Bearer",
     "not-before-policy": 0
   }
   ```
7. Capture the value of the `access_token` property and store it as your token.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/authentication
