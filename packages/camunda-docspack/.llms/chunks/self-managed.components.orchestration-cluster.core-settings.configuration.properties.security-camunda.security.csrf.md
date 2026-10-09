# Property reference — Security — `camunda.security.csrf`

| Property                                      | Description                                                                                                                                                                                                                                               | Default value | Overridable per Physical Tenant |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `camunda.security.csrf.enabled`               | Enables or disables CSRF protection. Disabling CSRF protection is not recommended for production environments as it leaves your application vulnerable to cross-site request forgery attacks.                                                             | `true`        | No                              |
| `camunda.security.csrf.cookie-http-only`      | Sets `HttpOnly` on the `X-CSRF-TOKEN` cookie. Leave this `false` for browser-facing web applications, which need to read the token from JavaScript. Set it to `true` only if you exclusively serve API clients that read the token from response headers. | `false`       | No                              |
| `camunda.security.csrf.ignored-path-patterns` | Ant-style path patterns that CSRF protection ignores, in addition to the unprotected paths and the login and logout endpoints, which are always ignored.                                                                                                  |               | No                              |

**Caution**
Disabling CSRF protection is not recommended for production environments as it leaves your application vulnerable to cross-site request forgery attacks. `ignored-path-patterns` has the same effect for any path it matches. Scope patterns as narrowly as possible, such as a specific API endpoint that doesn't rely on session-cookie authentication, rather than a broad prefix.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
