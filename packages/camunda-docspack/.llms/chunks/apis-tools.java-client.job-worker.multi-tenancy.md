# Job worker — Multi-tenancy

You can configure a job worker to pick up jobs belonging to one or more tenants. The job worker builder provides two ways to control which tenants a worker retrieves jobs for: explicitly providing tenant IDs, or using the tenants assigned to the worker in the engine.

### Filtering by assigned tenants

Use `.tenantFilter()` to control how the worker resolves tenants. It accepts a `TenantFilter` enum with two options:

- `TenantFilter.PROVIDED` _(default)_: The worker retrieves jobs for the tenant IDs explicitly provided via `.tenantId()` or `.tenantIds()`. See [Filtering by provided tenant IDs](#filtering-by-provided-tenant-ids) below.
- `TenantFilter.ASSIGNED`: The worker retrieves jobs for the tenants assigned to it in the engine. When this option is set, any tenant IDs configured via `.tenantId()` or `.tenantIds()` are ignored.

Using `TenantFilter.ASSIGNED`:

```java
client.newWorker()
    .jobType("myJobType")
    .handler(new MyJobTypeHandler())
    .tenantFilter(TenantFilter.ASSIGNED)
    .open();
```

### Filtering by provided tenant IDs

When using `TenantFilter.PROVIDED` (the default), you must also specify the tenant IDs the worker should retrieve jobs for.

**Note**
The client must be authorized for **all** the provided tenants. If it is not, the job worker will not work on any jobs.

Opening a job worker for a single tenant:

```java
client.newWorker()
    .jobType("myJobType")
    .handler(new MyJobTypeHandler())
    .tenantId("myTenant")
    .open();
```

Opening a job worker for multiple tenants:

```java
client.newWorker()
    .jobType("myJobType")
    .handler(new MyJobTypeHandler())
    .tenantIds("myTenant", "myOtherTenant")
    .open();
```

### Default tenant

You can configure the default tenant(s) using environment variables or system properties. It's configured using
`CAMUNDA_DEFAULT_JOB_WORKER_TENANT_IDS` or `camunda.client.worker.tenantIds` respectively.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
