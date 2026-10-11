# Connect Camunda to any OIDC provider — Complete configuration example — Verify before deploying

- All `<placeholders>` replaced with actual values.
- All client secrets stored in the `oidc-credentials` secret.
- Database credentials provided by the operator-managed database secrets (for example, `pg-identity-secret` and `pg-hub-secret`).
- Redirect URIs in OIDC provider match `redirectUrl` values.
- Each component has a distinct resource audience by default. Any cross-component audience acceptance supports a documented integration.
- Verify tokens contain `preferred_username` and `client_id` claims, or uncomment and configure alternative claim names.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
