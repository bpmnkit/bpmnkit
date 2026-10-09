# Install Camunda for production with Helm — Installation and configuration — Namespace setup

To get started, create two namespaces:

```bash
kubectl create namespace hub
kubectl create namespace orchestration
```

- **Namespace `hub`:** We will install [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index) and [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview).

- **Namespace `orchestration`**: We will install [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/overview), [Connectors](https://docs.camunda.io/docs/next/self-managed/components/connectors/overview) and [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview).

Each component is installed by the Helm chart automatically, and does not need to be installed separately.

**Note**
For more information on the difference between the Orchestration Cluster and Camunda Hub, see the Camunda 8 [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#orchestration-cluster-vs-camunda-hub).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
