# Storage isolation — Elasticsearch and OpenSearch storage

Each Physical Tenant can use a shared Elasticsearch or OpenSearch cluster with isolated index prefixes, or a dedicated cluster per tenant.

### Naming and collision prevention

Startup validation fails only when two tenants resolve to an identical index prefix. Overlapping prefixes are not detected, so `eu` and `eu-west` both pass validation even though `eu*` matches both tenants' indices.

Use the full tenant ID as the prefix, and make sure no tenant's prefix is the leading substring of another tenant's prefix.

### Configuration models

**Shared cluster with index prefix isolation** (recommended for cost-efficiency):

```yaml
camunda:
  data:
    secondary-storage:
      type: elasticsearch # or opensearch
      elasticsearch:
        url: https://es.example.com:9200
        index-prefix: default
  physical-tenants:
    tenanta:
      data:
        secondary-storage:
          elasticsearch:
            index-prefix: tenanta # must be unique per tenant
    tenantb:
      data:
        secondary-storage:
          elasticsearch:
            index-prefix: tenantb
```

**Separate cluster per tenant** (maximum isolation):

```yaml
camunda:
  data:
    secondary-storage:
      type: elasticsearch
      elasticsearch:
        url: https://es-default.example.com:9200
        index-prefix: default
  physical-tenants:
    tenanta:
      data:
        secondary-storage:
          elasticsearch:
            url: https://es-tenanta.example.com:9200
            index-prefix: tenanta
```

For AWS-hosted OpenSearch Service, including authentication with AWS credentials, see [Amazon OpenSearch Service storage](#amazon-opensearch-service-storage) below.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
