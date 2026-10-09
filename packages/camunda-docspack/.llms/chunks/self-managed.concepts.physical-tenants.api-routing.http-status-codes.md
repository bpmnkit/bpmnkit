# API routing for Physical Tenants — HTTP status codes

| Scenario                                                           | HTTP status        |
| ------------------------------------------------------------------ | ------------------ |
| Request to a configured tenant with valid credentials              | `2xx`              |
| Request to a configured tenant with missing or invalid credentials | `401 Unauthorized` |
| Request to an unknown or unconfigured tenant                       | `404 Not Found`    |

A `404` for an unknown tenant does not indicate an authorization failure. The tenant does not exist in the cluster configuration, so authentication has not yet been attempted.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing
