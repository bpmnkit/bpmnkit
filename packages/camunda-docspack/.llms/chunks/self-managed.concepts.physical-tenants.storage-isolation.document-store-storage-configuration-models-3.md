# Storage isolation — Document Store storage — Configuration models (3)

**What Camunda compares.** Nothing. In-memory stores are ephemeral and process-local, so they can't collide in backing storage and are excluded from the check.

Declare one store per tenant if you want documents kept apart within the process, or share one store ID across tenants if you don't. Either way there's no cross-tenant validation to satisfy.

```yaml
camunda:
  physical-tenants:
    default:
      document:
        assigned: [scratch]
        default-store-id: scratch
        in-memory:
          scratch: {}
    tenanta:
      document:
        assigned: [scratch]
        default-store-id: scratch
        in-memory:
          scratch: {}
```

**Warning**
In-memory stores provide no isolation guarantee and lose every document when the process stops. Use them for local development only, never to separate tenants in production.

**What Camunda compares.** The configured `path` forms the namespace, with separators resolved per platform. The key prefix is always empty because the directory alone decides. Paths are compared case-insensitively on every platform because a case-insensitive filesystem makes `/var/Docs` and `/var/docs` one directory.

Local stores have no subpath field, so each tenant needs its own directory:

```yaml
camunda:
  physical-tenants:
    default:
      document:
        assigned: [shared-local]
        default-store-id: shared-local
        local:
          shared-local:
            path: "/var/camunda/documents/default"
    tenanta:
      document:
        assigned: [shared-local]
        default-store-id: shared-local
        local:
          shared-local:
            # Use a sibling directory rather than one nested under another tenant's path.
            path: "/var/camunda/documents/tenant-a"
```

**Startup outcomes.**

| Tenant A          | Tenant B                   | Outcome                                                                                               |
| ----------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `path: /var/docs` | `path: /var/other`         | Accepted. Different directories.                                                                      |
| `path: /var/docs` | `path: /var/docs/`         | Rejected. Trailing separators aren't part of the location.                                            |
| `path: /var/Docs` | `path: /var/docs`          | Rejected. Paths are compared case-insensitively on every platform.                                    |
| `path: \var\docs` | `path: /var/docs`          | Rejected on Windows, accepted on Linux. Separators are resolved per platform.                         |
| `path: /var/docs` | `path: /var/docs/tenant-b` | Accepted, though not recommended. Nesting isn't compared for local stores. See the limitations below. |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
