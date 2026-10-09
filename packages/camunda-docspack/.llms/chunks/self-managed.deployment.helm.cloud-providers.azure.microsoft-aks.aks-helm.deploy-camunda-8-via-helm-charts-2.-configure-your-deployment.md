# Install Camunda 8 on an AKS cluster — Deploy Camunda 8 via Helm charts — 2. Configure your deployment

#### Enable Enterprise components

Web Modeler, Console, and Management Identity are not enabled by default in this deployment.

To enable these enterprise components in an OIDC-enabled full cluster, first deploy the required infrastructure (PostgreSQL, Elasticsearch/OpenSearch, and an IdP, such as Keycloak) using the official operators, then apply the Helm values examples shown in [deploy required dependencies with operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
