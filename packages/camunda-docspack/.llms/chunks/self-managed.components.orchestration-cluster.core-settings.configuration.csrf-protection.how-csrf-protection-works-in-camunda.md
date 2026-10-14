# CSRF protection — How CSRF protection works in Camunda

- **Token generation**: A unique CSRF token is generated and stored in a cookie named `X-CSRF-TOKEN`. The cookie is `HttpOnly` only when [`camunda.security.csrf.cookie-http-only`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecuritycsrf) is `true`. The default is `false`, so browser applications can read the token with JavaScript.
- **Token validation**: For state-changing requests (POST, PUT, DELETE, etc.), the server validates that the CSRF token
  in the request header `X-CSRF-TOKEN` matches the one in the cookie.
- **Safe methods**: GET, HEAD, TRACE, and OPTIONS requests are considered safe and don't require CSRF validation.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/csrf-protection
