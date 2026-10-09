# Manual installation with RDBMS — Supported installation targets

- VM-based deployments
- Bare-metal installations
- Standalone Java application deployments


## Prerequisites

- **Supported RDBMS**: See [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).
- **JDBC drivers**: See [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration).
- **Schemas and scripts**: Use the bundled SQL or Liquibase scripts for schema creation and upgrades. See [access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).


## When to choose manual installation

Choose manual installation when you run Camunda 8 on **VMs, bare metal, or a standalone Java runtime** and need full control over the operating system, networking, and lifecycle management.

If you run on Kubernetes, use [Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/index). For local development or evaluation, consider [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/index
