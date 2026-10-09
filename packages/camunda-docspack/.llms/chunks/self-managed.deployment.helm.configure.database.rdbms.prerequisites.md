# Configure RDBMS in Helm chart — Prerequisites

Provide a supported relational database that is reachable by the Camunda components.

See the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for the complete list of supported databases and versions.

Ensure that:

- Your network allows traffic from Camunda pods to the database.
- Required JDBC parameters (SSL/TLS, authentication, failover) are configured as needed.
- The database user has permissions to create and modify schema objects if `autoDDL` is enabled.

For a short checklist and troubleshooting steps you can run after configuring the database, see [validate RDBMS connectivity (Helm)](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms
