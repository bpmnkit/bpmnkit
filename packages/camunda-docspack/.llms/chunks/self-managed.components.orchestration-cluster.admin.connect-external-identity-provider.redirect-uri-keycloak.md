# Connect Admin to an identity provider — Redirect URI — keycloak

```yaml
camunda.security.authentication.oidc.client-id: <YOUR_CLIENTID>
camunda.security.authentication.oidc.client-secret: <YOUR_CLIENTSECRET>
camunda.security.authentication.oidc.issuer-uri: "https://<KEYCLOAK_HOST>/realms/<REALM_NAME>"
camunda.security.authentication.oidc.redirect-uri: "http://localhost:8080/sso-callback"
camunda.security.authentication.oidc.username-claim: "preferred_username"
camunda.security.authentication.oidc.audiences: <YOUR_CLIENTID>
camunda.security.authentication.oidc.scope: ["openid", "profile", "email"]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
