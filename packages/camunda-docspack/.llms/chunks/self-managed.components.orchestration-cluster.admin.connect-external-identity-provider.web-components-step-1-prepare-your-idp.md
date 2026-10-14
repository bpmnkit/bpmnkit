# Connect Admin to an identity provider — Web components — Step 1: Prepare your IdP

Before configuring Camunda, you must first prepare your IdP:

1. Register a new application/client for the Orchestration Cluster in your IdP.
   - Set the application type to "Web" or "Confidential".
   - Enable OIDC support.
   - Configure the necessary scopes (for example, `openid`, `profile`, `email`).
   - Ensure the client is allowed to access user information.
2. Set the **redirect URI** to match your Camunda deployment (default: `http://localhost:8080/sso-callback`).
3. Assign the users or groups who require access to Camunda 8.
4. (Optional) Configure group or other claims if you want to use group-based authorizations or mapping rules in Camunda.
5. Note the **client ID**, **client secret**, and **issuer URI** as these are required during Camunda configuration.

**Note**
For most IdPs, the default claim for the username is `sub` (subject). If you want to use a different claim (for example, `preferred_username` or `email`), configure your IdP to include it in the token, and update the [Orchestration Cluster configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camunda.security.authentication.oidc).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
