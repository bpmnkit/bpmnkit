# Configure RDBMS in Helm chart — Bundled vs. custom JDBC drivers

Camunda bundles JDBC drivers for some databases. For others, you must supply a custom driver. See [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for the complete list of supported databases.

**See:** [JDBC driver management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers) for:

- Which drivers are bundled
- When to supply custom drivers
- How to load drivers (init containers, custom images, volumes)


## Search APIs and result limits

RDBMS search APIs return a `totalResults` field capped at **10,000** by default (configurable via `camunda.data.secondary-storage.rdbms.query.max-total-hits`). Actual query performance depends on filter selectivity and database optimization.

See [search APIs and result limits](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-search-and-result-limits) for configuration options, performance trade-offs, optimization best practices, and database-specific tuning.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms
