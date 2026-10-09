# Cross-region cold recovery — Limitations

- Cluster recovery from a backup restores only the Orchestration cluster state. It does not restore Intelligent Document Processing objects.
- Private connectivity must be re-established by the customer and is currently supported for AWS clusters only.
- Recovery is cold and creates a new cluster. It is not an active-active or warm-standby configuration.
- Failover and failback depend on backup replication and may be affected by replication lag.
- Failover requires at least one available backup in the recovery region. If none is available, failover cannot proceed.
- Bring Your Own Key (BYOK) failover is supported for AWS clusters only.

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
