# Camunda Helm chart — Versioning

Starting with Camunda 8.4 (January 2024), the Helm chart version is independent of the application version. For example, the chart version may be `9.0.0` while the application version is `8.4.x`.

To see which application versions are included in a specific Helm chart, see the [Camunda 8 Helm Chart Version Matrix](https://helm.camunda.io/camunda-platform/version-matrix/).


## Get started

To install Camunda with the default orchestration cluster, see [Install Camunda with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).

If managed databases or an external OIDC provider are not available in your organization, see [Deploy required dependencies](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure) to set up PostgreSQL, Elasticsearch, and Keycloak on Kubernetes using official operators.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/index
