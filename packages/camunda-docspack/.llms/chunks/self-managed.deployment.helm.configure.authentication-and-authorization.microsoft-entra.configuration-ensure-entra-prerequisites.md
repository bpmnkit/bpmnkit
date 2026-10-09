# Set up the Helm chart with an external Microsoft Entra tenant — Configuration — Ensure Entra prerequisites

For authentication, the Camunda components use the following scopes:
`email`, `openid`, `offline_access`, `profile`, and `<CLIENT_UUID>/.default`.

**Tip: Optional scopes**
The `offline_access` scope is optional.

If this scope is included, your OIDC provider issues a refresh token to Camunda components on user login. The components use the refresh token to renew the user's access token when it expires, so that sessions remain active without requiring the user to log in again.

If `offline_access` is not included, users will be redirected to the OIDC provider for re-authentication whenever their access token expires. For more information, see the [OpenID Connect Core specification](https://openid.net/specs/openid-connect-core-1_0.html#OfflineAccess).

To allow users to successfully authenticate with Entra ID, you must either configure an [admin consent workflow](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-admin-consent-workflow) or grant consent on behalf of your users using [admin consent](https://learn.microsoft.com/en-gb/entra/identity/enterprise-apps/user-admin-consent-overview#admin-consent).

The applications you configure in this guide must support the following `grant_type` values:

- To create an M2M token: `client_credentials` (response contains an access token)
- To renew a token using a refresh token: `refresh_token`
- To create a token via authorization code flow: `authorization_code` (response contains access and refresh tokens)

These grant types are enabled by default, but they may be restricted by custom policies in your organization.

**Note: Disable UserInfo for Entra**
Microsoft Entra's `/userinfo` endpoint is served by Microsoft Graph, which requires the access token to have a Graph audience. The `<CLIENT_UUID>/.default` scope used in this guide audiences the token to the Camunda client instead, so Entra always rejects the call. Set `user-info-enabled: false` for this provider to skip it. See [troubleshoot OIDC authentication](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc#userinfo-endpoint-rejects-the-access-token) for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
