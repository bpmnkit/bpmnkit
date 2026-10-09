# Configure zone-aware multi-region deployments — The scheme is fixed for the life of the cluster

Zone-aware brokers carry the composite ID `<zone>_<index>`. Round-robin brokers carry a plain node ID. Do not change `scheme` on a running release. To move an existing cluster onto zone awareness, follow the [migration procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration).

**Warning**
Changing `orchestration.partitioning.scheme` on a running release is not a values change you can apply on its own. The migration procedure keeps both broker generations alive through `orchestration.partitioning.keepUnzonedBrokers`. It then moves the partition distribution with the cluster management API. Set the scheme when you create the cluster, or follow that procedure. Do not edit the key in place.

The chart states the same constraint at render time. An upgrade that flips the scheme prints a warning instead of failing silently.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness
