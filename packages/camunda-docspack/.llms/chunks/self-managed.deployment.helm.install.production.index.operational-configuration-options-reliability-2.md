# Install Camunda for production with Helm — Operational configuration options — Reliability (2)

- Set a `topologyKey` that your nodes carry. `topology.kubernetes.io/zone` is standard on managed cloud clusters, but bare-metal and local clusters often have no zone label. With `whenUnsatisfiable: DoNotSchedule` and no matching node label, no broker can be scheduled at all.
- Prefer `whenUnsatisfiable: ScheduleAnyway`. It provides best-effort spreading: Kubernetes does not guarantee an even distribution and does not rebalance existing brokers. A hard constraint (`DoNotSchedule`) combined with the default hard `podAntiAffinity` can leave broker pods permanently `Pending` when zones have uneven node counts, or stall a rolling update — use it only when every zone has enough spare capacity.
- Broker volumes pin pods to a zone. With topology-constrained storage, `volumeBindingMode: WaitForFirstConsumer` delays volume binding or provisioning until the scheduler picks a node, so the volume matches that node's topology; `Immediate` binds or provisions the volume without considering pod scheduling constraints. Once a broker's claim is bound to a single-zone volume, every replacement pod must run in that zone: a hard zone constraint that conflicts with the volume's zone leaves the pod `Pending`, and enabling spreading on an existing cluster does not relocate existing volumes.
- The `labelSelector` counts pods across the whole namespace. Pods with matching labels from all Helm releases in the namespace are counted together, not only the release you are configuring. To scope spreading to a single release, also match `app.kubernetes.io/instance: <release-name>`.

For an overview of all pod scheduling values, see [configure pod scheduling](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-scheduling).

#### Secondary storage index replicas

**Warning: Single point of failure without replicas**
The Elasticsearch/OpenSearch Exporter defaults to zero index replicas for the Zeebe record indices it creates. Without replicas, a single node restart moves its shards to UNASSIGNED state and puts the cluster into RED health. Two consequences follow:

- **Exporter backpressure builds up**: the Orchestration Cluster pauses exports when ES/OS cannot accept writes, which eventually throttles process execution throughput.
- **Optimize analytics data goes stale**: the Optimize importer reads from these Zeebe record indices. While shards are UNASSIGNED, Optimize cannot read newly exported records, so its analytics data lags behind until the node rejoins.

The cluster recovers once the node rejoins and shards are reassigned.

In multi-node Elasticsearch/OpenSearch clusters, configure at least one index replica:

```yaml
camunda:
  database:
    index:
      numberOfReplicas: 1
```

Each replica stores a full copy of the primary shard data, approximately doubling disk usage for those indices. Account for this when sizing your cluster. See [Managing secondary storage: Replicas](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/managing-secondary-storage#replicas) for full guidance.

#### Version management

Stay on a stable Camunda and Kubernetes version. Follow Camunda’s [release notes](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-release-notes) for security patches or critical updates.

#### Secret management

Secrets should be created prior to installing the Helm chart so they can be referenced as existing secrets. Create your secrets explicitly using `kubectl` or an external secret manager, then reference them in your Helm values files. For details, see the [secret management guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management).

**Note**
It is best to store secrets in an external secret manager such as [Vault by HashiCorp](https://www.vaultproject.io/) in case of a total outage.

#### Upgrades

When upgrading the Camunda Helm chart, make sure to read the [upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/index) and corresponding new version release notes before upgrading. Perform the upgrade on a test environment first before attempting in production.

The following is an example configuration for the Orchestration Cluster to create persistent storage:

```yaml
orchestration:
  extraVolumes:
    - name: persistent-state
      emptyDir: {}
  extraVolumeMounts:
    - name: persistent-state
      mountPath: /mount
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
