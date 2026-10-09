# Configure zone-aware multi-region deployments — Values the chart derives from the zone list

You describe the topology once, and the chart computes the rest. Knowing what it derives tells you which values you must not set yourself.

| Rendered setting                     | Derived from                                                     |
| :----------------------------------- | :--------------------------------------------------------------- |
| `camunda.cluster.size`               | Sum of `numberOfBrokers` across all zones                        |
| `camunda.cluster.replication-factor` | Sum of `numberOfReplicas` across all zones                       |
| StatefulSet replica count            | `numberOfBrokers` of the local zone                              |
| `CAMUNDA_CLUSTER_ZONE` in the pod    | `orchestration.partitioning.zone`                                |
| `camunda.cluster.node-id`            | The pod ordinal, which is the broker's index inside its own zone |

A zone-aware broker uses the composite ID `<zone>_<index>`, so the zone name keeps each broker unique across the cluster. The index restarts at `0` in every zone, and no cluster-wide offset applies.

### Provide initial contact points beyond one zone

The chart generates initial contact points only for a single-zone cluster, because one zone sits behind one headless service the chart can address itself. Once the cluster spans more than one zone, the chart cannot know how brokers reach each other across zones. It then generates nothing, and you supply the list through the application environment variables.

A cluster that spans more than one zone with no contact points still renders and installs. The chart prints a `[camunda][warning]` that tells you to set `CAMUNDA_CLUSTER_INITIALCONTACTPOINTS` through `orchestration.env`. The chart does not fail the render. A missing list therefore appears as brokers that never form a cluster, not as a failed `helm upgrade`. Treat the warning as an error.

One entry per zone is enough, and it does not have to name a specific broker. A broker resolves a contact point once, to a single address. An entry that points at a zone's headless Zeebe service reaches whichever broker pod DNS returns.

A broker only has to reach one live member to join. SWIM membership gossip carries the rest of the cluster from there. For what contact points do, see [setting up a cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster). The chart sets `publishNotReadyAddresses: true` on that service. The name therefore resolves to a pod during a cold start, before any broker is ready. For how that flag works, see [Kubernetes headless services](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services).

You can also list every broker pod. That list tolerates more of the zone being down at bootstrap. You then rewrite the list whenever a zone's broker count changes.

Contact points matter only while the cluster bootstraps. Once brokers have found each other, membership gossip carries new members, so a broker joining later does not need to appear in anyone's list.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness
