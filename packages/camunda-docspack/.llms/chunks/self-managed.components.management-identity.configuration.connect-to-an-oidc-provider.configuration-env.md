# Connect Management Identity to an identity provider — Configuration — env

```
   CAMUNDA_IDENTITY_TYPE=GENERIC
   CAMUNDA_IDENTITY_BASE_URL=<IDENTITY_URL>
   CAMUNDA_IDENTITY_ISSUER=<URL_OF_ISSUER>
   CAMUNDA_IDENTITY_ISSUER_BACKEND_URL=<URL_OF_ISSUER> // this is used for container to container communication
   CAMUNDA_IDENTITY_CLIENT_ID=<Client ID from Step 3>
   CAMUNDA_IDENTITY_CLIENT_SECRET=<Client secret from Step 3>
   CAMUNDA_IDENTITY_AUDIENCE=<Audience from Step 3>
   IDENTITY_INITIAL_CLAIM_NAME=<Initial claim name  if not using the default "oid">
   IDENTITY_INITIAL_CLAIM_VALUE=<Initial claim value>
   SPRING_PROFILES_ACTIVE=oidc
```

**Note**
Once set, you cannot update your initial claim name and value using environment variables or Helm values. You must change these values directly in the database.

<h3>Additional considerations</h3>

For authentication, the Camunda components use the scopes `email`, `openid`, `offline_access`, and `profile`.

**Tip: Optional scopes**
The `offline_access` scope is optional.

If this scope is included, your OIDC provider issues a refresh token to Management Identity on user login. Management Identity uses the refresh token to renew the user's access token when it expires, so that sessions remain active without requiring the user to log in again.

If `offline_access` is not included, users will be redirected to the OIDC provider for re-authentication whenever their access token expires. For more information, see the [OpenID Connect Core specification](https://openid.net/specs/openid-connect-core-1_0.html#OfflineAccess).

If your organization restricts this scope for security reasons, you can adjust the scopes with:

```
CAMUNDA_IDENTITY_AUTH_SCOPES="openid profile email"
```

This configuration allows login without the `offline_access` scope.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
