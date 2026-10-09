# Property reference — Cluster — `CAMUNDA_CLUSTER_METADATA`

| Property                                      | Description                                                                                                                                                         | Default value | Overridable per Physical Tenant |
| :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------ | :------------------------------ |
| `CAMUNDA_CLUSTER_METADATA_SYNCDELAY`          | The delay between two sync requests in the `ClusterConfigurationManager`. A sync request is sent to another node to get the latest topology of the cluster.  | `10s`         | No                              |
| `CAMUNDA_CLUSTER_METADATA_SYNCREQUESTTIMEOUT` | The timeout for a sync request in the `ClusterConfigurationManager`.                                                                                         | `2s`          | No                              |
| `CAMUNDA_CLUSTER_METADATA_GOSSIPFANOUT`       | The number of nodes to which a cluster topology is gossiped.                                                                                                 | `2`           | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
