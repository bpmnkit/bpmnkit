# CSRF protection — Security considerations

- Always use HTTPS in production to prevent token interception.
- Consider additional security headers configured in the security settings.
- Regularly review the patterns in `camunda.security.csrf.ignored-path-patterns` and keep each pattern as narrow as possible.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/csrf-protection
