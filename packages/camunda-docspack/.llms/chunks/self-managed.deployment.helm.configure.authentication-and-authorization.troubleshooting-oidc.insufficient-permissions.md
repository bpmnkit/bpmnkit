# Troubleshoot OIDC authentication — Insufficient permissions

**Observed behavior:** You authenticate, but Camunda shows "Insufficient permissions".

**Why this happens:** Your account hasn't been granted access via mapping rules.

**How to fix:** In Management Identity, create a mapping rule that matches your claim values and assign the appropriate role. See [Managing mapping rules](https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules) for more details.


## Claim not found

**Observed behavior:** Logs show "Claim not found" or "Required claim missing" errors.

**Why this happens:** The configured claim name doesn't exist in tokens issued by your provider.

**How to fix:**

1. Decode a token to see available claims. See [JWT token claims reference](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims) for instructions.
2. Update `usernameClaim` or `clientIdClaim` in Helm values to match the actual claim names.
3. Redeploy Camunda.

**Common alternatives:**

- User claims: `email`, `preferred_username`, `sub`
- Client claims: `client_id`, `azp`, `appid`.

For a complete list of common claim patterns by provider, see [JWT token claims reference](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims#common-claim-patterns-by-provider).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
