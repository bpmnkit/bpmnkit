# CSRF protection — How CSRF protection works in Camunda

- **Token generation**: A unique CSRF token is generated and stored in a secure, HTTP-only cookie named `X-CSRF-TOKEN`.
- **Token validation**: For state-changing requests (POST, PUT, DELETE, etc.), the server validates that the CSRF token
  in the request header `X-CSRF-TOKEN` matches the one in the cookie.
- **Safe methods**: GET, HEAD, TRACE, and OPTIONS requests are considered safe and don't require CSRF validation.


## Protected vs unprotected paths

### Protected paths (require CSRF token)

- `/api/**` – API endpoints (except specifically excluded paths)
- `/v2/**` – Versioned API endpoints
- All state-changing operations (POST, PUT, DELETE, PATCH)

### Unprotected paths (no CSRF token required)

- `/actuator/**` – Health and monitoring endpoints
- `/v2/license` – Public license endpoint
- `/error` – Error handling
- Authentication endpoints (`/login`, `/logout`)
- Safe HTTP methods (GET, HEAD, OPTIONS, TRACE)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/csrf-protection
