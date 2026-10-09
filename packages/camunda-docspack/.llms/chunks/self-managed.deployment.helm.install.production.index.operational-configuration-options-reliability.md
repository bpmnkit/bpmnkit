# Install Camunda for production with Helm — Operational configuration options — Reliability

The following resources and configuration options are important to keep in mind regarding reliability:

#### Persistent volume reclaim policy

**Warning: Risk of data loss**
If your StorageClass uses a `Delete` reclaim policy (the default in many Kubernetes distributions and OpenShift), Orchestration Cluster broker data will be **permanently lost** if a PVC is deleted. This can lead to complete data loss and is unrecoverable.

Ensure your StorageClass uses a `Retain` reclaim policy for production deployments.

Verify your configuration on Kubernetes:

```bash
kubectl get storageclass
# RECLAIMPOLICY should show "Retain", not "Delete"
```

On OpenShift, verify your configuration using the `oc` CLI:

```bash
oc get storageclass
# RECLAIMPOLICY should show "Retain", not "Delete"
```

**Note: Equivalent mechanisms**
Alternative configurations that preserve the underlying volume and allow it to be reattached to a recreated PVC are also acceptable — for example, patching the `persistentVolumeReclaimPolicy` of individual PVs to `Retain`, or admission policies (Kyverno, Gatekeeper) enforcing `Retain` on dynamically provisioned PVs. Reattaching a retained PV to a new PVC may require manual steps, such as clearing the `claimRef` on the released PV, depending on your provisioner. Snapshot- or backup-based strategies are not equivalent, because they do not preserve the original volume binding required for a Zeebe broker to resume from its existing partition data without manual recovery. If you rely on an alternative mechanism, you are responsible for validating it against your upgrade and disaster recovery scenarios in a non-production environment.

For more details, see [troubleshooting](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting#zeebe-data-loss-after-pvc-deletion) and the [Kubernetes documentation on reclaim policies](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaiming).

#### Node affinity and tolerations

- Check node affinity and tolerations. Refer to the [Kubernetes documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) to modify the node affinity and tolerations.

  For example, this is the default affinity configuration for the zeebe Pod in the Camunda Helm chart:

  ```yaml
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchExpressions:
              - key: app.kubernetes.io/component
                operator: In
                values:
                  - zeebe-broker
          topologyKey: kubernetes.io/hostname
  ```

  This configuration ensures that Zeebe Pods with the default label `app.kubernetes.io/component=zeebe-broker` are not scheduled on the same node. The primary benefits include:
  - High availability: If one node fails, other nodes running the same component remain unaffected.
  - Load distribution: Balances the workload across nodes.
  - Fault tolerance: Reduces the impact of a node-level failure.

- It is possible to set a `podDisruptionBudget`, as in the following example for the Orchestration Cluster:

  ```yaml
  orchestration:
    podDisruptionBudget:
      enabled: false
      minAvailable: 0
      maxUnavailable: 1
  ```

#### Topology spread constraints

Topology spread constraints control how pods are distributed across failure domains such as availability zones. The default `podAntiAffinity` configuration ensures Zeebe broker pods run on distinct nodes, but does not ensure those nodes are in different zones: if the cluster has more nodes than brokers, all brokers can still be scheduled into a single availability zone. Because broker persistent volumes are bound to a single zone on most cloud providers, a zonal outage can then take down the whole Orchestration Cluster.

With `orchestration.topologySpreadConstraints`, you can spread broker pods across zones. The Orchestration Cluster is deployed as a single StatefulSet, and its pods run the Zeebe broker and gateway in the same process, so this value covers both. It does not affect separately deployed components such as Identity, Optimize, Connectors, or Web Modeler, which have no equivalent topology spread value in the current chart version.

```yaml
orchestration:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: ScheduleAnyway
      labelSelector:
        matchLabels:
          app.kubernetes.io/component: zeebe-broker
```

Keep the following in mind when configuring topology spread constraints:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
