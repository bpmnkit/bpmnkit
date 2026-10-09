# RDBMS configuration overview

Learn how to configure Camunda to use a relational database as secondary storage, including exporter setup, schema management, privileges, and connection settings.

Camunda can use a relational database (RDBMS) as the secondary storage backend for Operate, Tasklist, Identity, and the Camunda REST API.

This page explains how RDBMS configuration works at the application level. If you are deploying with Helm, see:

- [RDBMS configuration in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)
- [Access native SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts)

For supported database vendors and versions, see the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

**Tip: Need end-to-end guidance?**
For a unified setup guide covering provisioning, topology decisions, driver management, and backup strategies across both Orchestration Cluster and Camunda Hub, see the [end-to-end RDBMS setup guide](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide). This guide is useful both when starting a new setup and when harmonizing existing component configurations.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
