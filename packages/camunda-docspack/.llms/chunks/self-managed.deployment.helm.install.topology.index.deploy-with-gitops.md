# Install the Camunda 8.10 deployment topology — Deploy with GitOps

The topology values are deterministic and don't require cluster discovery or imperative deployment tooling. Store each release's values with its own Helm release definition.

Apply resources in the [install order](#install-order). For Flux, make each orchestration `HelmRelease` depend on the Hub release:

```yaml
spec:
  dependsOn:
    # This is the Flux HelmRelease metadata.name, not Helm's releaseName.
    - name: <hub-helmrelease-name>
      namespace: hub
```

For Argo CD, use sync waves or separate Applications so the Hub release becomes healthy before orchestration releases are synchronized, and each orchestration release before its Optimize releases.

For Keycloak-managed registration, client Secret names can be identical across namespaces, but Kubernetes Secrets remain namespace-scoped. Project both copies from the same external secret source to prevent drift.

The standalone chart-managed PersistentVolumeClaims for Management Identity, Optimize, and Connectors render when the corresponding component's `persistence.enabled` value is `true`, even when the release topology suppresses that component's workload. This behavior keeps PVC ownership declarative and produces the same desired resources with Helm, Argo CD, and Flux. Set `persistence.enabled` to `false` only after you no longer need the chart to manage that claim and have verified your GitOps pruning and storage reclaim policies.

**Warning**
Orchestration Cluster broker PVCs are StatefulSet volume claim templates and don't follow this standalone PVC behavior. Changing a release to `hub` mode suppresses the Orchestration Cluster StatefulSet. Preserve and migrate broker storage separately when you move an existing cluster between releases or namespaces.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
