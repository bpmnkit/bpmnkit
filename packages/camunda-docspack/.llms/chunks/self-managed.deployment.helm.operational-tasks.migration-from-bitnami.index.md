# Migrate from Bitnami subcharts

Migrate your Camunda 8 Self-Managed infrastructure from Bitnami subcharts to production-grade alternatives such as Kubernetes operators or managed services.

**Warning**
Camunda 8.9 is the last version that ships Bitnami subcharts. Starting with Camunda 8.10 (Helm chart `15.x`), the bundled Bitnami subcharts (PostgreSQL, Elasticsearch, and Keycloak) are removed from the Camunda Helm chart.

If you run Camunda 8.9 (or earlier) with Bitnami subcharts and want to migrate to Kubernetes operators or managed services, follow the [migration guide in the 8.9 documentation](https://docs.camunda.io/docs/8.9/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/).

New Camunda 8.10 installations should provision [operator-based infrastructure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure) or managed services directly, without Bitnami subcharts.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/index
