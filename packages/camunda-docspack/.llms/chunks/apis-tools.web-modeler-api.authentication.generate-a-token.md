# Authentication — Generate a token

1. Create client credentials by clicking **Organization > Manage organization > Administration API > Create new credentials**.
2. Add permissions to this client for **Web Modeler API** with the needed CRUD permissions.
3. Once you have created the client, capture the following values required to generate a token:
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
4. Execute an authentication request to the token issuer:
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
5. Capture the value of the `access_token` property and store it as your token.

1. [Add an M2M application in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/applications).
2. [Add permissions to this application](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/applications) for **Web Modeler API** with the needed [CRUD permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview#preset-permissions).
3. Capture the `Client ID` and `Client Secret` from the application in Management Identity.
4. [Generate a token](https://docs.camunda.io/docs/next/self-managed/components/management-identity/authentication) to access the Web Modeler REST API. Provide the `client_id` and `client_secret` from the values you previously captured in Management Identity.
   ```shell
   curl --location --request POST 'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token' \
   --header 'Content-Type: application/x-www-form-urlencoded' \
   --data-urlencode "client_id=${CLIENT_ID}" \
   --data-urlencode "client_secret=${CLIENT_SECRET}" \
   --data-urlencode 'grant_type=client_credentials'
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
5. Capture the value of the `access_token` property and store it as your token.

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/authentication
