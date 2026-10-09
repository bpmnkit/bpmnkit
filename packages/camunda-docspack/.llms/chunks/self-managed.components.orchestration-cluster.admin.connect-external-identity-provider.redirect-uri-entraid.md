# Connect Admin to an identity provider — Redirect URI — entraid

```yaml
camunda.security.authentication.oidc.client-id: <YOUR_CLIENTID>
camunda.security.authentication.oidc.client-secret: <YOUR_CLIENTSECRET>
camunda.security.authentication.oidc.issuer-uri: "https://login.microsoftonline.com/<YOUR_TENANT_ID>/v2.0"
camunda.security.authentication.oidc.redirect-uri: "http://localhost:8080/sso-callback"
camunda.security.authentication.oidc.username-claim: "oid"
camunda.security.authentication.oidc.audiences: <YOUR_CLIENTID>
camunda.security.authentication.oidc.scope: ["openid", "profile", "<YOUR_CLIENTID>/.default"]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
