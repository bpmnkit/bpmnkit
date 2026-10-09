# Configure pod scheduling

Configure node selectors, tolerations, affinity, and topology spread constraints for Camunda component pods in Self-Managed Helm deployments.

The Camunda Helm chart exposes values that control where Kubernetes schedules component pods. Use these settings to place pods on specific nodes, tolerate node taints, or spread pods across failure domains such as availability zones.


## Configure scheduling values

Each of the following components supports `nodeSelector`, `tolerations`, and `affinity` values that map directly to the corresponding [Kubernetes pod spec fields](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/):

- `orchestration`
- `identity`
- `optimize`
- `connectors`
- `camundaHub.restapi`
- `camundaHub.websockets`

`global.nodeSelector` applies a node selector to all components that don't set their own.

By default, the chart configures a hard `podAntiAffinity` rule for the Orchestration Cluster so that no two broker pods are scheduled on the same node.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-scheduling
