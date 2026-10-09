# Storage isolation — Document Store storage

Store documents globally with per-tenant subpaths, or use dedicated stores per tenant. Camunda validates the resulting layout at startup and refuses to start if two tenants would read and write into the same storage.

| Layout                          | Use when                                                                   | Tenant configuration                                                                   |
| ------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Shared store with sibling paths | You want lower operational overhead while preserving structural isolation. | Assign the same store and configure a distinct sibling path or prefix for each tenant. |
| Dedicated store per tenant      | You need the strongest operational separation.                             | Assign each tenant a separate bucket, container, or directory.                         |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
