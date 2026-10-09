# Debugging the authentication flow — Test the IdP directly

To determine whether a failure originates at your identity provider or within Camunda, request a token directly from the IdP, bypassing Camunda entirely:

```bash
curl -X POST '<token-endpoint>' \
  -d 'client_id=<client-id>' \
  -d 'client_secret=<client-secret>' \
  -d 'grant_type=client_credentials' \
  -d 'scope=openid'
```

- If the request fails or returns an error, investigate the IdP configuration, grant type, network, or firewall. The problem isn't specific to Camunda.
- If the request succeeds, decode the returned token as described in [inspect the JWT](#inspect-the-jwt) and confirm it contains the claims Camunda expects. If the token contains the expected claims but Camunda still rejects the request, check Camunda's authorization configuration, including mapping rules, roles, and authorizations.

For interactive browser logins, complete the login flow directly on your IdP's hosted login page before troubleshooting Camunda. This confirms whether the user can authenticate with the IdP.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication
