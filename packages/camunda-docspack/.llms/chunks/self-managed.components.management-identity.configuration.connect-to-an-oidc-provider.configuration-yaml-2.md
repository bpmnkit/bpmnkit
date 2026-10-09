# Connect Management Identity to an identity provider — Configuration — yaml

```yaml
camunda:
  identity:
    type: "MICROSOFT"
    baseUrl: <IDENTITY_URL>
    authUrl: https://login.microsoftonline.com/<Microsoft Entra tenant ID>/v2.0
    tokenUrl: https://login.microsoftonline.com/<Microsoft Entra tenant ID>/v2.0
    clientId: <Client ID from Step 2>
    clientSecret: <Client secret from Step 5>
    audience: <Client ID from Step 2>
identity:
  initialClaimName: <Initial claim name if not using the default "oid">
  initialClaimValue: <Initial claim value>
spring:
  profiles:
    active: oidc
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider
