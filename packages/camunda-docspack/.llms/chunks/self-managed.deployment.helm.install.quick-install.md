# Install Camunda with Helm for development

Install Camunda 8 Self-Managed on Kubernetes using the Helm chart with default settings, suitable for testing and development.

Use this guide to quickly install the Camunda 8 orchestration cluster for testing and development.

<!-- TODO: add links to explain the Orchestration Cluster and management plane -->

**Tip: Need a Kubernetes cluster?**
If you don't have a Kubernetes cluster yet, check out our setup guides:

- **Local development**: Follow our [kind tutorial](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind) to set up a local Kubernetes cluster.
- **Cloud providers**: See our [cloud provider guides](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/index) for Amazon EKS, Google GKE, Azure AKS, and Red Hat OpenShift.

**Note**
In this guide, you deploy the Orchestration Cluster with Basic authentication and RDBMS (embedded H2) as secondary storage. For a full deployment with all components (Optimize, Web Modeler, Console, Management Identity, and Keycloak), follow our [kind tutorial](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind). For production environments, see the [production installation guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install
