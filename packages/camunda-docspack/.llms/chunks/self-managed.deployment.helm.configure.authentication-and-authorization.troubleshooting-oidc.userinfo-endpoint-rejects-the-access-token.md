# Troubleshoot OIDC authentication — UserInfo endpoint rejects the access token

**Observed behavior:** Login succeeds, but logs show a warning similar to:

```text
OIDC /userinfo call failed for registration '<registration-id>' (invalid_user_info_response); continuing login with ID-token-only claims. Set user-info-required=true for this provider to fail login instead, or adjust the requested scope so the access token is accepted at this IdP's userinfo endpoint.
```

Any claims that would normally come from the `/userinfo` response, and aren't already present in the ID token, are missing from the session.

**Why this happens:** Your identity provider's `/userinfo` endpoint rejected the access token Camunda sent it, most often because of an audience mismatch. This is structural for several identity providers, not a misconfiguration:

- **Microsoft Entra:** UserInfo is served by Microsoft Graph, which requires an access token whose audience is Microsoft Graph, never the Camunda client. The documented Entra scopes include `<CLIENT_UUID>/.default`, which always produces this mismatch. See [Ensure Entra prerequisites](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra#ensure-entra-prerequisites).
- **Auth0, Okta, and PingFederate:** The same rejection occurs whenever the access token is bound to an `audience` other than the provider's own UserInfo endpoint.

**How to fix:**

1. By default, no fix is needed. Login continues using only the claims from the ID token.
2. If this provider's authorization-relevant claims (for example, group membership) are only available from UserInfo, set `user-info-required: true` for that provider so a rejected call fails login loudly instead of silently continuing without those claims. See [`camunda.security.authentication.oidc.user-info-required`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecurityauthenticationoidc).
3. To skip the UserInfo call entirely instead, for example if you don't need any claims from it, set `user-info-enabled: false` for that provider.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
