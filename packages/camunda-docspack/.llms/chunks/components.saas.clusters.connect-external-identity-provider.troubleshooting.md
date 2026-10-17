# Connect an external identity provider — Troubleshooting

### "The issuer did not answer at its discovery endpoint. Make sure that the URL is correct, and that the provider is reachable from the internet."

Camunda couldn't reach the discovery endpoint derived from your issuer URL. Confirm the issuer URL is correct and that your provider's discovery endpoint is reachable from the internet.

### "The issuer URL does not match the provider's configuration..."

The issuer that your provider's discovery document returns doesn't exactly match the issuer URL you entered. A common cause is copying a URL from the wrong tenant or environment. Copy the issuer URL directly from your provider, including its exact path.

### "The provider's configuration is missing authorization_endpoint, token_endpoint, jwks_uri."

Your provider's discovery document doesn't include one or more endpoints OIDC discovery requires. Confirm your IdP fully supports OIDC discovery, and that the issuer URL points at the correct tenant or realm.

### The issuer URL is rejected before Camunda even checks for a provider

Camunda also rejects an issuer URL that doesn't use `https`, contains credentials, or contains a query string or a fragment. Remove these from the URL and try again.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/connect-external-identity-provider
