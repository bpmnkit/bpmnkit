# CSRF protection — Protected vs unprotected paths

### Protected paths (require CSRF token)

- `/api/**` – API endpoints (except specifically excluded paths)
- `/v2/**` – Versioned API endpoints
- All state-changing operations (POST, PUT, DELETE, PATCH)

### Unprotected paths (no CSRF token required)

- `/actuator/**` – Health and monitoring endpoints
- `/v2/license` – Public license endpoint
- `/error` – Error handling
- Authentication endpoints (`/login`, `/logout`)

If a path matches both lists, it is unprotected. For example, `/v2/license` requires no token although `/v2/**` is protected.

To exempt more paths, set [`camunda.security.csrf.ignored-path-patterns`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecuritycsrf) to a list of Ant-style path patterns.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/csrf-protection
