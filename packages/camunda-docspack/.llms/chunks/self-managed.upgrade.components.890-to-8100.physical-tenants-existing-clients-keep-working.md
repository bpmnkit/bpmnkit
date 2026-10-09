# Upgrade Camunda components from 8.9 to 8.10 — Physical Tenants — Existing clients keep working

| Caller   | 8.9 request             | 8.10 behavior                                                                                                      |
| :------- | :---------------------- | :----------------------------------------------------------------------------------------------------------------- |
| REST     | `/v2/...`               | Unchanged. Routes to the `default` Physical Tenant, and is also addressable as `/physical-tenants/default/v2/...`. |
| gRPC     | No tenant header        | Unchanged. Requests without the `Camunda-Physical-Tenant` header route to the `default` Physical Tenant.           |
| Web apps | `/operate`, `/tasklist` | Unchanged. `/operate` and `/physical-tenants/default/operate` address the same application.                        |

No client code changes are required for a single-tenant deployment. For the full routing rules, see [API routing for Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
