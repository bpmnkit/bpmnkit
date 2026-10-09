# Storage isolation — Document Store storage — Configuration models

**What Camunda compares.** Three properties. `bucket-name` and `endpoint` form the namespace, and `bucket-path` becomes the key prefix. Bucket names are compared case-insensitively, endpoints by scheme, host, port, and path only, and bucket paths case-sensitively after being coerced to end in `/`.

Every other AWS property is ignored: `region`, because S3 bucket names are globally unique across regions, and `bucket-ttl`, `force-path-style`, `chunked-encoding-enabled`, and `support-legacy-md5`, because none of them change which objects a store reads and writes.

**Global store with per-tenant subpaths** (recommended):

```yaml
camunda:
  document:
    default-store-id: shared-s3
    aws:
      shared-s3:
        bucket-name: "camunda-documents"
  physical-tenants:
    default:
      document:
        assigned: [shared-s3]
        aws:
          shared-s3:
            bucket-path: "default"
    tenanta:
      document:
        assigned: [shared-s3]
        aws:
          shared-s3:
            # Sibling paths. Neither tenant's path may be nested inside the other's,
            # and neither tenant may leave the path unset to use the bucket root.
            bucket-path: "tenant-a"
```

**Dedicated store per tenant.** Distinct buckets are distinct namespaces, so `bucket-path` is optional here:

```yaml
camunda:
  physical-tenants:
    default:
      document:
        assigned: [default-s3]
        default-store-id: default-s3
        aws:
          default-s3:
            bucket-name: "camunda-documents-default"
    tenanta:
      document:
        assigned: [tenant-a-s3]
        default-store-id: tenant-a-s3
        aws:
          tenant-a-s3:
            bucket-name: "camunda-documents-tenant-a"
```

**Startup outcomes.**

| Tenant A                    | Tenant B                                          | Outcome                                                                  |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| `bucket-path: tenant-a`     | `bucket-path: tenant-b`                           | Accepted. Sibling prefixes.                                              |
| `bucket-path` unset         | `bucket-path: tenant-b`                           | Rejected. The bucket root is a prefix of every key in the bucket.        |
| `bucket-path: tenant-a`     | `bucket-path: tenant-a/nested`                    | Rejected. One prefix is nested inside the other.                         |
| `bucket-path: tenant`       | `bucket-path: tenant-b-`                          | Accepted. Both are coerced to end in `/`, so neither encloses the other. |
| `bucket-path: Tenant-A/`    | `bucket-path: tenant-a/`                          | Accepted. S3 keys are case-sensitive.                                    |
| `region: us-east-1`         | `region: eu-west-1`, rest identical               | Rejected. Region isn't part of the location.                             |
| `endpoint: https://minio-a` | `endpoint: https://minio-b`, same bucket and path | Accepted. Different endpoints are different namespaces.                  |
| `endpoint: https://MINIO/`  | `endpoint: https://minio`, same bucket and path   | Rejected. Host case and trailing slashes are ignored.                    |

**What Camunda compares.** `bucket-name` forms the namespace, and `prefix` becomes the key prefix. Bucket names are compared case-insensitively, prefixes case-sensitively.

Unlike AWS and Azure, the GCP prefix is used exactly as written. No trailing separator is appended, so a prefix is not necessarily a folder. An unset `prefix` resolves to `temp/`.

**Global store with per-tenant subpaths** (recommended):

```yaml
camunda:
  document:
    default-store-id: shared-gcs
    gcp:
      shared-gcs:
        bucket-name: "camunda-documents"
  physical-tenants:
    default:
      document:
        assigned: [shared-gcs]
        gcp:
          shared-gcs:
            prefix: "default/"
    tenanta:
      document:
        assigned: [shared-gcs]
        gcp:
          shared-gcs:
            # Sibling prefixes. Because no separator is appended, end each prefix in '/'
            # yourself so one tenant's prefix can't run into another's.
            prefix: "tenant-a/"
```

**Dedicated store per tenant.** Distinct buckets are distinct namespaces, so `prefix` is optional here:

```yaml
camunda:
  physical-tenants:
    default:
      document:
        assigned: [default-gcs]
        default-store-id: default-gcs
        gcp:
          default-gcs:
            bucket-name: "camunda-documents-default"
    tenanta:
      document:
        assigned: [tenant-a-gcs]
        default-store-id: tenant-a-gcs
        gcp:
          tenant-a-gcs:
            bucket-name: "camunda-documents-tenant-a"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
