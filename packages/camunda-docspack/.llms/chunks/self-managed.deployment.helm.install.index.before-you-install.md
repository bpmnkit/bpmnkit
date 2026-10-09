# Install Camunda with Helm — Before you install

Camunda 8.10 bundles no Elasticsearch, PostgreSQL, or Keycloak subcharts. Camunda recommends the Helm CLI v4, and supports Helm CLI v3 (3.10 or later) until February 10, 2027.

- Provision your databases, secondary storage, and identity provider first. See [deploy required dependencies](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).
- Use the Helm CLI v4 for new installations. See [Helm CLI support and chart compatibility](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/helm-v4#camunda-helm-chart-compatibility).
- Decide which settings belong in `values.yaml` and which belong in a component's `extraConfiguration`. See [Helm and application configuration responsibilities](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/index
