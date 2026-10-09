# Connect to multiple identity providers — Overview — yaml

```yaml
camunda.security.authentication.providers.oidc.<provider-id>.client-id: <YOUR_CLIENTID>
camunda.security.authentication.providers.oidc.<provider-id>.client-name: <YOUR_CLIENTNAME>
camunda.security.authentication.providers.oidc.<provider-id>.client-secret: <YOUR_CLIENTSECRET>
camunda.security.authentication.providers.oidc.<provider-id>.issuer-uri: <YOUR_ISSUERURI>
camunda.security.authentication.providers.oidc.<provider-id>.redirect-uri: <YOUR_REDIRECTURI>
camunda.security.authentication.providers.oidc.<provider-id>.token-uri: <YOUR_TOKENURI>
camunda.security.authentication.providers.oidc.<provider-id>.jwk-set-uri: <YOUR_JWKSETURI>
camunda.security.authentication.providers.oidc.<provider-id>.scope: ["openid"]
camunda.security.authentication.providers.oidc.<provider-id>.audiences: <YOUR_CLIENTID>
camunda.security.authentication.providers.oidc.<provider-id>.grant-type: <GRANT_TYPE>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-multiple-identity-providers
