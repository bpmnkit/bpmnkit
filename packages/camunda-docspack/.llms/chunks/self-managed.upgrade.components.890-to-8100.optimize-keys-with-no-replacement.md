# Upgrade Camunda components from 8.9 to 8.10 — Optimize — Keys with no replacement

The following keys are no longer used in 8.10. Optimize still starts if you leave them in place, but they have no effect, so remove them:

- `CAMUNDA_OPTIMIZE_SECURITY_AUTH_TOKEN_SECRET`
- `CAMUNDA_OPTIMIZE_SECURITY_AUTH_COOKIE_MAX_SIZE`
- `CAMUNDA_OPTIMIZE_SECURITY_AUTH_COOKIE_SAME_SITE_ENABLED`
- `security.responseHeaders.X-XSS-Protection`

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
