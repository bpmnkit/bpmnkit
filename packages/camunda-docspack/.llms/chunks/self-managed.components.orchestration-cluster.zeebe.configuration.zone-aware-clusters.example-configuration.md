# Zone-aware clusters — Example configuration

The following configures a three-zone cluster in which `us-east1` is the preferred zone for partition leaders:

```yaml
camunda:
  cluster:
    size: 5
    replication-factor: 5
    # set per broker; env: CAMUNDA_CLUSTER_ZONE
    zone: us-east1
    partitioning:
      scheme: ZONE_AWARE
      zone-aware:
        zones:
          - name: us-east1
            number-of-brokers: 2
            number-of-replicas: 2
            priority: 1000
          - name: us-west2
            number-of-brokers: 2
            number-of-replicas: 2
            priority: 500
          - name: eu-west1
            number-of-brokers: 1
            number-of-replicas: 1
            priority: 10
```

Each broker sets its own `camunda.cluster.zone`, while the `zone-aware.zones` list is the same across all brokers in the cluster.

For the full list of properties and their environment-variable equivalents, see the [cluster configuration reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters
