# Dual-Region — Region failure and recovery

In a dual-region setup, losing either region affects Camunda 8 processing because of Zeebe's quorum requirements.

When a region becomes unavailable, the Zeebe cluster loses quorum (half of its brokers become unreachable) and **immediately stops processing** new data. All components stop processing until the failover procedure completes.

This section covers the Orchestration Cluster. Failover doesn't recover Management Identity, Camunda Hub, or Optimize. For their behavior on region loss, see [Management platform and Orchestration Cluster](#management-platform-and-orchestration-cluster).

### Physical Tenant topology during failover

A Physical Tenant removed from configuration is disabled, but it remains in the persisted cluster topology until it is logically removed. Multi-region failover operations require every tenant in the topology to be accounted for, so a disabled tenant can block failover. Before starting failover, compare configured tenants with the persisted topology and resolve any disabled tenants. See [logically remove a disabled tenant](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle#logically-remove-a-disabled-tenant) for lifecycle details.

**Warning: Immediate impact**
Region failure causes **immediate service interruption**:

- No new process instances can start.
- Running process instances are suspended.
- User interfaces become unavailable if the primary region is lost.

See the [operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops) for recovery and re-establishment steps.

**Caution**
Monitor for region failures and execute the [operational procedures](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops) promptly to ensure smooth recovery.

### Primary region failure

If the primary region fails:

- **Service disruption**: User traffic is unavailable.
- **Zeebe halt**: Processing stops due to quorum loss.
- **Data loss**: With v1 APIs, region-specific data (batch operations, task assignments) is lost. With v2 REST API and Tasklist V2, the Camunda Exporter replicates all data to both regions, so data remains available after region failure.

#### Recovery steps for primary region failure

1. **Temporary recovery**: Follow the [operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops#failover-phase) to restore functionality and unblock the process automation engine (Zeebe).
2. **Traffic rerouting**: With v2 APIs (default in 8.9+), remove the failed region from serving traffic (for example, via DNS or load balancer health checks). With v1 APIs, redirect user traffic to the secondary region (now primary).
3. **Data and task management** (v1 API setups only):
   - Reassign uncompleted tasks lost from the previous primary region.
   - Recreate batch operations in Operate.
4. **Permanent region setup**: Follow the [operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops#failback-phase) to create a new secondary region.

### Secondary region failure

If the secondary region fails:

- **Zeebe halt**: Processing stops due to quorum loss.
- **UI availability**: Operate and Tasklist remain accessible from the primary region.
- **Process execution**: No new process instances can start. Zeebe suspends running instances until quorum is restored.

#### Recovery steps for secondary region failure

1. **Temporary recovery**: Follow the [operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops#failover-phase) to restore processing.
2. **Permanent region setup**: Follow the [operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops#failback-phase) to create a new secondary region.

**Note**
Unlike primary region failure, no user-facing data is lost and no traffic rerouting is necessary.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
