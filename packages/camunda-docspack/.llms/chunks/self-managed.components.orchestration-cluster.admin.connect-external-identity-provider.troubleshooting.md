# Connect Admin to an identity provider — Troubleshooting

### General authentication issues

If authentication does not work as expected:

- Check your application logs for authentication errors.
- Ensure your IdP client is configured to allow the specified redirect URI.
- Verify the claim names match your IdP's token claims.

### RP-initiated logout

If RP-initiated logout does not behave as expected, check your application logs for the following messages.

#### Unable to determine end-session endpoint

If you configure OIDC using explicit authorization, token, or logout URIs instead of the issuer URI, and do not specify a logout endpoint, the following message is logged:

```
Unable to determine end-session endpoint for OIDC logout. Falling back to {baseLogoutUrl} without logout hint.
```

Ensure you either:

- Configure the `issuer-uri` so Admin can retrieve the logout endpoint from the OIDC discovery document, or
- Explicitly set the `end-session-endpoint-uri`.

#### No client registration found

If the `registrationId` used for logout (the identifier of the configured OIDC client registration) cannot be resolved, Admin cannot construct an RP-initiated logout request. The following message is logged:

```
No client registration found for id `{registrationId}`. Falling back to {baseLogoutUrl} without logout hint.
```

Verify that the configured client registration ID matches the OIDC client definition in your IdP configuration.

#### Missing login_hint / logout_hint

Some IdPs require a `logout_hint` parameter for RP-initiated logout. Admin derives `logout_hint` from the OIDC user's `login_hint` claim. This claim typically contains a user identifier, such as a username or email, which the IdP uses to identify the session to terminate.

If no `login_hint` is present, the following message is logged and the logout request is sent without a logout hint:

```
No 'login_hint' claim found in OIDC user. Falling back to '{baseLogoutUrl}' without logout hint.
```

Ensure that your IdP includes a `login_hint` claim in the ID token if your IdP requires `logout_hint` during logout.

#### No post-logout redirect URL configured

You must explicitly configure the post-logout redirect URL in your IdP. If no valid post-logout redirect URL is available, Admin falls back to a default path. In this case, the following message is logged:

```
No valid post-logout redirect URL found in session, falling back to default: '/'
```

Ensure that the post-logout redirect URL (`<camunda-host>/post-logout`) is registered in your IdP configuration.

#### IdP `end_session_endpoint` not available

If RP-initiated logout is enabled but the IdP does not expose an `end_session_endpoint`, the local Orchestration Cluster session is terminated and the following message is displayed:

```
The identity provider's end_session_endpoint is not available. The local session has been terminated, but the IdP session will still be active.
```

The user is signed out of Camunda, but their IdP session remains active.

To resolve this:

- Verify that your IdP supports RP-initiated logout and exposes an `end_session_endpoint`.
- If your IdP does not support RP-initiated logout, disable it by setting `idp-logout-enabled` to `false`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
