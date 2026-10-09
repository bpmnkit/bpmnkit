# Install Camunda with Helm for development — Notes and requirements

- **Zeebe** supports Kubernetes startup and liveness probes. See [Gateway health probes](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes).
- **Zeebe** must be deployed as a [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/) to preserve cluster node identities. StatefulSets require persistent storage, which you must provision in advance. The type of storage depends on your cloud provider.
- **Docker pull limits** apply when downloading Camunda 8 images from Docker Hub. To avoid disruptions, authenticate with Docker Hub or use a mirror registry.
- **Air-gapped environments** require additional configuration. See [Helm chart air-gapped environment installation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation).
- **Full deployment**: To deploy all Camunda 8 components with OIDC authentication and Kubernetes operators, follow our [kind tutorial](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind) or the [cloud provider guides](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/index).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install
