# Connect Management Identity to an identity provider — Configuration — env

```
    CAMUNDA_IDENTITY_TYPE=MICROSOFT
    CAMUNDA_IDENTITY_BASE_URL=<IDENTITY_URL>
    CAMUNDA_IDENTITY_ISSUER=https://login.microsoftonline.com/<Microsoft Entra tenant ID>/v2.0
    CAMUNDA_IDENTITY_ISSUER_BACKEND_URL=https://login.microsoftonline.com/<Microsoft Entra tenant ID>/v2.0
    CAMUNDA_IDENTITY_CLIENT_ID=<Client ID from Step 2>
    CAMUNDA_IDENTITY_CLIENT_SECRET=<Client secret from Step 5>
    CAMUNDA_IDENTITY_AUDIENCE=<Client ID from Step 2>
    IDENTITY_INITIAL_CLAIM_NAME=<Initial claim name if not using the default "oid">
    IDENTITY_INITIAL_CLAIM_VALUE=<Initial claim value>
    SPRING_PROFILES_ACTIVE=oidc
```

**Danger**
Once set, your initial claim name and value cannot be updated using environment variables or Helm values, and must be changed directly in the database.

<h3>Additional considerations</h3>

Due to technical limitations regarding [third party content](https://openid.net/specs/openid-connect-frontchannel-1_0.html#ThirdPartyContent), front channel single sign out is not supported. This means that when a user logs out of one component, they will not be logged out of the other components.

For authentication, the management and modeling components use the scopes `email`, `openid`, `offline_access`, `profile`,
and `<CLIENT_UUID>/.default`. To ensure your users are able to successfully authenticate with Entra ID, you must ensure that either there is an [admin consent flow configured](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-admin-consent-workflow) or grant consent on behalf of your users using the [admin consent](https://learn.microsoft.com/en-gb/entra/identity/enterprise-apps/user-admin-consent-overview#admin-consent) process.

The client should be configured to support `grant_type`:

- To **create** an M2M token, the `client_credentials` grant type is required. The response contains an access token.
- To **renew** a token using a refresh token, the `refresh_token` grant type is required.
- To **create** a token via authorization flow, the `authorization_code` grant type is required. The response contains both access and refresh tokens.

To successfully authenticate with Entra ID, you should use the `v2.0` API. This means that
the `CAMUNDA_IDENTITY_ISSUER_BACKEND_URL` value should end with `/v2.0`.

Follow the [Microsoft Entra instructions](https://learn.microsoft.com/en-us/entra/identity-platform/reference-microsoft-graph-app-manifest#configure-the-app-manifest-in-the-microsoft-entra-admin-center) to configure the app manifest, and set the [requestedAccessTokenVersion](https://learn.microsoft.com/en-us/entra/identity-platform/reference-microsoft-graph-app-manifest#api-attribute) under `Api:` to `2`:

```json
    "requestedAccessTokenVersion": 2,
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
