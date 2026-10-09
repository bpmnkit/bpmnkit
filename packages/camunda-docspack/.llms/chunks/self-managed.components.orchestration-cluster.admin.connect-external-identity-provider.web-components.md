# Connect Admin to an identity provider — Web components

Configure Admin so your users can use your IdP to authenticate to the Orchestration Cluster.

### Prerequisites

- A Camunda 8 Orchestration Cluster (Self-Managed).
- Access to an OIDC-compliant IdP (for example, Keycloak, Auth0, Okta, Microsoft EntraID).
- Client credentials (client ID, client secret, issuer URI) from your IdP.

### Step 1: Prepare your IdP

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

### Step 2: Choose your deployment and configuration method

You can configure OIDC using `application.yaml` or environment variables.

Select the option that best fits your deployment approach.

### Step 3: Set the authentication method to OIDC

Set the authentication method to OIDC using the following settings:

### yaml

```yaml
camunda.security.authentication.method: oidc
```

### env

```
CAMUNDA_SECURITY_AUTHENTICATION_METHOD=oidc
```

### Step 4: Configure the OIDC connection details

Set the following properties using the respective values from your IdP:

### yaml

```yaml
camunda.security.authentication.oidc.client-id: <YOUR_CLIENTID>
camunda.security.authentication.oidc.client-secret: <YOUR_CLIENTSECRET>
camunda.security.authentication.oidc.issuer-uri: <YOUR_ISSUERURI>
camunda.security.authentication.oidc.redirect-uri: <YOUR_REDIRECTURI>
camunda.security.authentication.oidc.username-claim: <YOUR_USERNAMECLAIM>
camunda.security.authentication.oidc.audiences: <YOUR_CLIENTID>
camunda.security.authentication.oidc.scope: ["openid"]
```

### env

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTID=<YOUR_CLIENTID>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTSECRET=<YOUR_CLIENTSECRET>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ISSUERURI=<YOUR_ISSUERURI>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_REDIRECTURI=<YOUR_REDIRECTURI>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_USERNAMECLAIM=<YOUR_USERNAMECLAIM>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_AUDIENCES=<YOUR_CLIENTID>
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_SCOPE=["openid"]
```

**Tip**
If your OIDC provider needs to be reached using different URLs from the browser and backend (for example, when running in Docker or behind a reverse proxy), you can configure separate URIs instead of a single `issuer-uri`. See [use separate OIDC provider URIs for browser and backend](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/special-oidc-cases#use-separate-oidc-provider-uris-for-browser-and-backend) for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
