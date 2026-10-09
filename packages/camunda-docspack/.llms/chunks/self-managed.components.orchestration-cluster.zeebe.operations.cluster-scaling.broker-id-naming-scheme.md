# Cluster scaling — Broker id naming scheme

How brokers are identified and scaled depends on whether the cluster is [zone-aware](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters). By default a cluster is **not zone-aware**.

- **Non-zone-aware** clusters use **integer** broker ids: (`0`, `1`, `2`, ...). They are used as examples in this page.
- **Zone-aware** clusters use **string** broker ids: `${zone}_${n}` (for example, `"zone-a_0"` with double quotes).


## Considerations

- Scaling operations occur while the cluster remains online. During scaling, data is redistributed and new leaders are elected for affected partitions.
- Existing partitions continue processing data, but you may notice temporary performance impacts until scaling completes. Plan scaling ahead of anticipated load increases to minimize disruption.
- When adding new partitions or brokers, partitions are redistributed across both old and new brokers. Depending on the number of brokers and partitions, this may increase the load per broker. Use the API endpoints in [dry run](#dry-run) mode to preview partition distribution.
- Always take a backup before scaling to ensure you can restore if needed.
- Scaling is a planned configuration change. The cluster rejects a new configuration change while another one is still running.
- A dynamic scaling operation does not require a rolling restart. Static configuration changes, such as adding a Physical Tenant, still follow the [provisioning and lifecycle](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/provisioning-and-lifecycle) restart procedure.
- Gateway replicas are scaled separately from brokers and partitions. In Helm deployments, adjust `zeebe-gateway.replicas`. Gateway scaling changes shared request capacity but does not change partition placement.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
