# Property reference — Cluster — `camunda.cluster.metadata`

| Property                                        | Description                                                                                                                                                         | Default value | Overridable per Physical Tenant |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------ | :------------------------------ |
| `camunda.cluster.metadata.sync-delay`           | The delay between two sync requests in the `ClusterConfigurationManager`. A sync request is sent to another node to get the latest topology of the cluster.  | `10s`         | No                              |
| `camunda.cluster.metadata.sync-request-timeout` | The timeout for a sync request in the `ClusterConfigurationManager`.                                                                                         | `2s`          | No                              |
| `camunda.cluster.metadata.gossip-fanout`        | The number of nodes to which a cluster topology is gossiped.                                                                                                 | `2`           | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
