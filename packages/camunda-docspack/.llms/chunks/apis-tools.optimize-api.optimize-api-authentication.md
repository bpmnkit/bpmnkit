# Authentication

Connect business process-related event data and variable data held in external systems from third-party systems to Optimize, and more.

All Optimize API requests except [the health readiness](https://docs.camunda.io/docs/next/apis-tools/optimize-api/health-readiness) endpoint require authentication. To authenticate, generate a [JSON Web Token (JWT)](https://jwt.io/introduction/) and include it in each request.


## Generate a token

1. [Create client credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) in Camunda Hub.
2. Add permissions to this client for **Optimize**.
3. Once you have created the client, capture the following values required to generate a token:
   <!-- this comment convinces the markdown processor to still treat the table as a table, but without adding surrounding paragraphs. 🤷 -->
   | Name                     | Environment variable name        | Default value                                |
   | ------------------------ | -------------------------------- | -------------------------------------------- |
   | Client ID                | `ZEEBE_CLIENT_ID`                | -                                            |
   | Client Secret            | `ZEEBE_CLIENT_SECRET`            | -                                            |
   | Authorization Server URL | `ZEEBE_AUTHORIZATION_SERVER_URL` | `https://login.cloud.camunda.io/oauth/token` |
   | Optimize REST Address    | `CAMUNDA_OPTIMIZE_BASE_URL`      | -                                            |
   <!-- this comment convinces the markdown processor to still treat the table as a table, but without adding surrounding paragraphs. 🤷 -->
**Caution**
   When client credentials are created, the `Client Secret` is only shown once. Save this `Client Secret` somewhere safe.
4. Execute an authentication request to the token issuer:
   ```bash
   curl --request POST ${ZEEBE_AUTHORIZATION_SERVER_URL} \
       --header 'Content-Type: application/x-www-form-urlencoded' \
       --data-urlencode 'grant_type=client_credentials' \
       --data-urlencode 'audience=optimize.camunda.io' \
       --data-urlencode "client_id=${ZEEBE_CLIENT_ID}" \
       --data-urlencode "client_secret=${ZEEBE_CLIENT_SECRET}"
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

1. [Configure the `camunda.security.authentication.oidc.audiences` setting](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-optimize#configure-oidc-for-optimize) in your Optimize installation to match the audience property of the **Optimize API** in [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview).
2. [Add an M2M application in Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/applications).
3. [Add permissions to this application](https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/applications) for **Optimize API**.
4. Capture the `Client ID` and `Client Secret` from the application in Management Identity.
5. [Generate a token](https://docs.camunda.io/docs/next/self-managed/components/management-identity/authentication) to access the Optimize REST API. Provide the `client_id` and `client_secret` from the values you previously captured in Management Identity.
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
6. Capture the value of the `access_token` property and store it as your token.

Through Camunda 8.9, Self-Managed also accepted a single shared access token on this API. Camunda 8.10 no longer accepts it. The token works only if you opt into the 8.9 component-specific configuration fallback, which Camunda plans to remove in a future release. See [Optimize static API access token is no longer supported](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#optimize-static-api-access-token-is-no-longer-supported).

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication
