# Storage isolation — Document Store storage — Configuration models (2)

**Startup outcomes.**

| Tenant A           | Tenant B                      | Outcome                                                                     |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------- |
| `prefix: a/`       | `prefix: b/`                  | Accepted. Sibling prefixes.                                                 |
| `prefix: docs/`    | `prefix: docs/archive/`       | Rejected. One prefix is nested inside the other.                            |
| `prefix: tenant`   | `prefix: tenant-b-`           | Rejected. No separator is appended, so `tenant` is a prefix of `tenant-b-`. |
| `prefix` unset     | `prefix: temp/`               | Rejected. An unset prefix resolves to `temp/`.                              |
| `prefix` unset     | `prefix: temp`                | Rejected. Both address keys under `temp`.                                   |
| `prefix: ""`       | `prefix: tenant-b-`           | Rejected. The bucket root is a prefix of every object name in it.           |
| `prefix: TenantA/` | `prefix: tenanta/`            | Accepted. GCS object names are case-sensitive.                              |
| `bucket-name: a`   | `bucket-name: b`, same prefix | Accepted. Different buckets are different namespaces.                       |

**What Camunda compares.** `container-name` and the blob endpoint the store resolves to form the namespace, and `container-path` becomes the key prefix. Container names are compared case-insensitively, container paths case-sensitively after being coerced to end in `/`.

A `connection-string` is resolved to the endpoint the store actually uses and reduced to scheme, host, port, and path. A query, fragment, or user info is dropped, so a shared access signature (SAS) token is neither part of the location nor printed in the error message.

**Global store with per-tenant subpaths** (recommended):

```yaml
camunda:
  document:
    default-store-id: shared-blob
    azure:
      shared-blob:
        container-name: "camunda-documents"
  physical-tenants:
    default:
      document:
        assigned: [shared-blob]
        azure:
          shared-blob:
            container-path: "default"
    tenanta:
      document:
        assigned: [shared-blob]
        azure:
          shared-blob:
            # Sibling paths. Neither tenant may leave the path unset to use the
            # container root, which encloses every blob name in the container.
            container-path: "tenant-a"
```

**Dedicated store per tenant.** Distinct containers are distinct namespaces, so `container-path` is optional here:

```yaml
camunda:
  physical-tenants:
    default:
      document:
        assigned: [default-blob]
        default-store-id: default-blob
        azure:
          default-blob:
            container-name: "camunda-documents-default"
    tenanta:
      document:
        assigned: [tenant-a-blob]
        default-store-id: tenant-a-blob
        azure:
          tenant-a-blob:
            container-name: "camunda-documents-tenant-a"
```

**Startup outcomes.**

| Tenant A                        | Tenant B                                                 | Outcome                                                              |
| ------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| `container-name: docs-a`        | `container-name: docs-b`                                 | Accepted. Different containers are different namespaces.             |
| `container-path: a`             | `container-path: a/nested`                               | Rejected. One prefix is nested inside the other.                     |
| Container root                  | `container-path: tenant-c`, same container               | Rejected. The container root is a prefix of every other key.         |
| `connection-string` for `accta` | `connection-string` for `acctb`, same container and path | Accepted. The two connection strings resolve to different endpoints. |
| `connection-string` for `acct`  | `endpoint: https://acct.blob.core.windows.net`           | Rejected. One account reached two ways.                              |
| `UseDevelopmentStorage=true`    | `endpoint: http://127.0.0.1:10000/devstoreaccount1`      | Rejected. The emulator shorthand resolves to that endpoint.          |
| `endpoint: …?sig=A`             | `endpoint: …?sig=B`, same account                        | Rejected. A SAS token is a credential, not a location.               |
| `container-path: Tenant-A/`     | `container-path: tenant-a/`                              | Accepted. Blob names are case-sensitive.                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
