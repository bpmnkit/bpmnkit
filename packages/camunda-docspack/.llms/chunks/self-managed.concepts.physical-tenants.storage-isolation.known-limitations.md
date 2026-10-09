# Storage isolation — Known limitations

**Secondary storage types must be compatible across tenants.** Use RDBMS for every tenant, Elasticsearch and OpenSearch in any combination, or `none` for every tenant. Do not mix RDBMS or `none` with another type. For example, a cluster where tenant A uses RDBMS and tenant B uses Elasticsearch is not supported.


## Storage configuration matrix

| Aspect                   | RDBMS                                                                               | Elasticsearch/OpenSearch                                                            | Document Store                     |
| ------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| **Isolation**            | Separate schema/database OR table prefix                                            | Separate cluster OR index prefix                                                    | Separate bucket OR sibling subpath |
| **Per-tenant config**    | JDBC URL                                                                            | `url` + `index-prefix`                                                              | Bucket + prefix                    |
| **Collision detection**  | Startup error                                                                       | Startup error                                                                       | Startup error                      |
| **Unavailable behavior** | Tenant degraded ([details](#secondary-storage-failures-during-startup-and-runtime)) | Tenant degraded ([details](#secondary-storage-failures-during-startup-and-runtime)) | Runtime error (no fallback)        |
| **Mixed vendors**        | Yes                                                                                 | Yes (ES or OpenSearch)                                                              | Yes (different cloud providers)    |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
