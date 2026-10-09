# Configure zone-aware multi-region deployments — Describe the topology

With the `zone-aware` scheme, set the local zone and list every zone in the cluster:

```yaml
orchestration:
  partitioning:
    scheme: zone-aware
    zone: region-a
    zones:
      - name: region-a
        numberOfBrokers: 2
        numberOfReplicas: 2
        priority: 100
      - name: region-b
        numberOfBrokers: 3
        numberOfReplicas: 3
        priority: 50
```

Use the same `zones` list in every region and change only `zone` to name the local one. The list accepts any number of zones. One, two, and three are the common cases.

Each zone field maps to an application property. For what these properties do, see [zone-aware clusters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters) and the [`camunda.cluster.partitioning` reference](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundaclusterpartitioning).

| Helm value         | Application property |
| :----------------- | :------------------- |
| `name`             | `name`               |
| `numberOfBrokers`  | `number-of-brokers`  |
| `numberOfReplicas` | `number-of-replicas` |
| `priority`         | `priority`           |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness
