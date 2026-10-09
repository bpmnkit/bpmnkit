# Authentication and authorization for Physical Tenants — How token routing works

When a request arrives at an authenticated endpoint, Camunda matches the JWT token to the correct identity provider using two steps:

1. **Issuer matching:** The token's `iss` claim identifies which configured IdP issued the token.
2. **Audience matching (Model B):** For deployments with multiple role-level clients under the same IdP, the token's `aud` claim identifies the specific client registration. Camunda rejects tokens whose audience does not match the tenant's allowed configuration.

Both checks are enforced at the API security filter chain level. A token whose `iss` claim matches no configured provider fails with an authentication error naming the unrecognized issuer. A token with a valid issuer but a non-matching audience is also rejected.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
