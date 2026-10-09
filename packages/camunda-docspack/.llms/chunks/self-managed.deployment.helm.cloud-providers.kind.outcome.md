# Deploy Camunda 8 to a local kind cluster — Outcome

By the end of this tutorial, you'll have:

- A local Kubernetes cluster running with kind. This includes one control plane and two worker nodes.
- A Contour Ingress controller deployed for routing traffic (domain mode only).
- TLS certificates configured with mkcert (domain mode only).
- Prerequisite services deployed via Kubernetes operators:
  - Elasticsearch via ECK (used as secondary storage in this guide; RDBMS is a supported alternative — see [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms))
  - PostgreSQL (CloudNativePG)
  - Keycloak (Keycloak Operator)
- Camunda 8 Self-Managed fully deployed and accessible, connected to the operator-managed services.

**Info: Other installation profiles**
With this guide, you deploy the full Camunda 8 platform with all components. For lighter setups or specific use cases, see the [Helm installation guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install), which covers different installation profiles, such as core only, with Connectors, and with Camunda Hub.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
