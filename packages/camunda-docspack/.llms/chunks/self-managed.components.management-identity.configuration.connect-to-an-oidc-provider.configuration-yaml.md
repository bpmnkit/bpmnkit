# Connect Management Identity to an identity provider — Configuration — yaml

```yaml
camunda:
  identity:
    type: "GENERIC"
    baseUrl: <IDENTITY_URL>
    authUrl: <AUTH_URL_ENDPOINT>
    tokenUrl: <TOKEN_URL_ENDPOINT>
    jwksUrl: <JWKS_URL>
    clientId: <Client ID from Step 3>
    clientSecret: <Client secret from Step 3>
    audience: <Audience from Step 3>
identity:
  initialClaimName: <Initial claim name if not using the default "oid">
  initialClaimValue: <Initial claim value>
spring:
  profiles:
    active: oidc
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
