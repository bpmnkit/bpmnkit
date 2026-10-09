# Kubernetes deployment overview — Architecture — High availability (HA)

**Caution: Non-HA importer / archiver**
This applies to **Optimize**:

When scaling from a single pod to multiple pods, ensure that the `importer / archiver` is enabled on only one pod. Enabling it on more than one pod may cause data inconsistencies. This is a known limitation and will be addressed in a future update.

See the [Optimize system configuration guide](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8#general-settings) for example settings.

For high availability, we recommend a minimum of **four Kubernetes nodes** to ensure fault tolerance and support leader election. This is especially important when using the [Raft protocol](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes/<https:/en.wikipedia.org/wiki/Raft_(algorithm)>) for consensus within the Orchestration Cluster. For more details, refer to the [clustering documentation](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering).

While Deployments and StatefulSets in Kubernetes can scale independently of physical hardware, four nodes are typically required to support:

- The default three-node Orchestration Cluster (incl. Zeebe, Operate, Tasklist, and Admin)
- Other Camunda 8 components (Camunda Hub, Management Identity, and Optimize)

Depending on your specific use case, you may need to scale **horizontally** (more nodes) or **vertically** (larger nodes) to meet resource requirements.

By default, node affinity rules prevent all Orchestration Cluster pods from being scheduled on the same node. This requires at least three nodes for proper operation. For details, see the [Kubernetes node affinity documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/).

To further improve fault tolerance, distribute the Orchestration Cluster and other components across **multiple availability zones**. The default anti-affinity rules ensure Orchestration Cluster pods run on distinct nodes, but do not ensure those nodes are in different zones — use the `orchestration.topologySpreadConstraints` Helm value to spread them across zones. For configuration details and caveats, see [topology spread constraints](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index#topology-spread-constraints).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
