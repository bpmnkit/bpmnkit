# History — Partition distribution

The History Data Migrator assigns migrated history data to Zeebe partitions. **Partition assignment is critical for history cleanup to work correctly.**

### How partitions are assigned

- **Root process instances** or **standalone decisions**: Randomly assigned to available partitions
- **Child entities** (sub-processes, call activities, flow nodes, variables, user tasks, incidents, decision instances, etc.): Inherit partition from root process instance
- **Audit logs**: Inherit the root process instance partition, or are randomly assigned when not related to a process instance

This ensures all entities in a process hierarchy share the same partition, enabling the RDBMS exporter on that partition to perform cleanup.

**Warning: Partition configuration must match Zeebe topology**
Camunda 7 migrated history data can **only be deleted via history cleanup**, which requires:

- The partition ID exists in your Camunda 8 Zeebe cluster
- That partition has an RDBMS exporter configured

If partition IDs assigned during migration don't exist or lack RDBMS exporters, **that data cannot be cleaned up** and will persist indefinitely.

### Partition discovery

By default, the migrator queries Zeebe topology through the Camunda REST API at migration start to discover available partitions.

### Offline mode

To migrate without Camunda 8 REST API connectivity (no topology query), configure the partition count manually:

```yaml
camunda.migrator:
  history:
    partition-count: 3 # Must match your Camunda 8 cluster
```

When configured:

- Topology is not queried from REST API
- Partition IDs generated as sequence: 1, 2, 3, ...
- No Camunda 8 REST API connectivity is required at migration start (database connectivity is still required)

The configured value must exactly match your Camunda 8 Zeebe cluster's partition count.

If the configured value does not match the cluster, then:

- Data assigned to non-existent partitions cannot be cleaned up
- Data may persist indefinitely with no automatic cleanup path

Always verify cluster partition configuration before migration.

**Caution: Don't change partitions after migration**
Changing cluster partition count after migration can leave data on removed partitions that cannot be cleaned up. Complete history migration before scaling partitions.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
