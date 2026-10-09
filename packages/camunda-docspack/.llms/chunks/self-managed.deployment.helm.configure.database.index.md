# Helm chart database configuration

In this section, find details on database configuration associated with Kubernetes with Helm.

**Tip: Need end-to-end guidance for RDBMS?**
For a unified setup guide covering provisioning, topology decisions, driver management, and backup strategies across Orchestration Cluster and Web Modeler, see the [end-to-end RDBMS setup guide](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide). This guide is useful both when starting a new setup and when harmonizing existing component configurations.

**Tip: Choosing a secondary storage backend?**
Use the [secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) as the navigation hub for Elasticsearch/OpenSearch and RDBMS paths.

Use this section to configure database layers for Helm deployments.

This section is organized by component:

- [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/non-sql): Configure Elasticsearch or OpenSearch as secondary storage, or use [RDBMS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).
- [Management Identity and Camunda Hub](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres): Configure PostgreSQL for the management plane.
- [Optimize](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/index): Configure Elasticsearch or OpenSearch for Optimize.

Some Elasticsearch/OpenSearch tasks, such as custom headers and index prefixes, apply to both the Orchestration Cluster and Optimize. Those shared pages call that out explicitly.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/index
