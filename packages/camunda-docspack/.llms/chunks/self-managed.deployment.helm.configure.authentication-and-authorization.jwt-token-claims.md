# JWT token claims reference

Reference for identifying and decoding JWT token claims when configuring OIDC authentication for Camunda 8 Self-Managed.

Use this reference to understand the structure of JWT access tokens and identify the claims your OIDC provider uses. This information is required when configuring Camunda 8 to authenticate with an external identity provider.


## Obtain a test token

Request an access token using your OIDC client credentials:

```bash
curl -X POST 'https://your-provider.example.com/oauth/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=<your-client-id>' \
  -d 'client_secret=<your-client-secret>' \
  -d 'grant_type=client_credentials'
```

The response includes an `access_token` field containing the JWT.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims
