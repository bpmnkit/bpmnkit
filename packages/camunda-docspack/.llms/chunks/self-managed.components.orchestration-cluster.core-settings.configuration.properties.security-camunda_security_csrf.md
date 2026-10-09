# Property reference — Security — `CAMUNDA_SECURITY_CSRF`

| Property                                    | Description                                                                                                                                                                                                                                               | Default value | Overridable per Physical Tenant |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | :------------------------------ |
| `CAMUNDA_SECURITY_CSRF_ENABLED`             | Enables or disables CSRF protection. Disabling CSRF protection is not recommended for production environments as it leaves your application vulnerable to cross-site request forgery attacks.                                                             | `true`        | No                              |
| `CAMUNDA_SECURITY_CSRF_COOKIEHTTPONLY`      | Sets `HttpOnly` on the `X-CSRF-TOKEN` cookie. Leave this `false` for browser-facing web applications, which need to read the token from JavaScript. Set it to `true` only if you exclusively serve API clients that read the token from response headers. | `false`       | No                              |
| `CAMUNDA_SECURITY_CSRF_IGNOREDPATHPATTERNS` | Ant-style path patterns that CSRF protection ignores, in addition to the unprotected paths and the login and logout endpoints, which are always ignored.                                                                                                  |               | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
