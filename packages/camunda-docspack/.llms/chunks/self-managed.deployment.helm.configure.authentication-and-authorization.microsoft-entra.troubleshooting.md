# Set up the Helm chart with an external Microsoft Entra tenant — Troubleshooting

For issues common to any OIDC provider (invalid redirect URI, audience mismatch, missing claims, pods not starting), see [Troubleshoot OIDC authentication](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc). The following are specific to Microsoft Entra:

**`AADSTS700016: Application not found in the directory`**
The `clientId` in your Helm values doesn't match a registered application in your tenant. Verify each `clientId` exactly matches the **Application (client) ID** on the app registration's **Overview** page, and that the app is registered in the tenant identified by your `<tenant id>`.

**`AADSTS50011: Redirect URI mismatch`**
The redirect URI Camunda sent doesn't match any URI registered for that app. Verify `redirectUrl` in your Helm configuration exactly matches the redirect URI configured in Entra, including the path suffix, for example `/auth/login-callback` or `/sso-callback`.

**`401` with `jwt issuer invalid` or `"The iss claim is not valid"`**
The app registration is issuing v1.0 tokens (issuer `https://sts.windows.net/...`) instead of v2.0 tokens (issuer `https://login.microsoftonline.com/.../v2.0`). Confirm `api.requestedAccessTokenVersion` is set to `2` in the app's manifest (see [Create applications in Entra](#create-applications-in-entra)). This applies to all app registrations, including single-page applications.

**Service-to-service `401` with `clientId claim could not be found`**
If Connectors or another machine-to-machine caller gets this error, verify `clientIdClaim: azp` is set for the Orchestration Cluster. The bare-GUID scope format (`<oc-app-id>/.default`) causes Entra to issue v2.0 tokens, which carry the calling client's ID in `azp` rather than the `appid` claim used by v1.0 tokens.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
