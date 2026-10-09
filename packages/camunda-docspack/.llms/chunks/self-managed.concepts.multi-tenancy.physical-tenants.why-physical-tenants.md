# Physical Tenants — Why Physical Tenants

**Strong isolation without complexity:** Run multiple teams or organizations on one cluster with complete data separation and independent operations, without the overhead of managing multiple orchestration clusters.

**Independent operations:** Back up, restore, scale, and manage each Physical Tenant independently, without coordinating a window across every tenant in the cluster.

**Cost efficiency:** Share infrastructure while maintaining tenant autonomy, reducing operational overhead compared to multi-cluster deployments.


## Terminology

### Physical Tenant

An isolated execution unit within an Orchestration Cluster. Each Physical Tenant has separate data storage, independent lifecycle management, and API access scoped to that tenant.

### Default Physical Tenant

Every Orchestration Cluster automatically includes a default Physical Tenant created at provisioning time. The default Physical Tenant is immutable and cannot be renamed, disabled, or deleted. For backward compatibility, REST API traffic not explicitly scoped to a Physical Tenant is internally routed to the default Physical Tenant. This routing rule is specific to the `/v2/...` REST API; the actuator surface used for scaling and purging does not follow it (see [data purge](https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge) for an operation where an unscoped request instead targets every tenant).

### Cluster-wide operation

An operation that affects the entire Orchestration Cluster, such as cluster configuration updates, cluster-level health checks, or cluster backups. Cluster-wide operations are protected by the cluster-admin role and are not scoped to a specific Physical Tenant.

### Tenant-scoped operation

An operation that targets a specific Physical Tenant, such as deploying a process to a tenant, backing up a tenant's data, or querying a tenant's process instances.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants
