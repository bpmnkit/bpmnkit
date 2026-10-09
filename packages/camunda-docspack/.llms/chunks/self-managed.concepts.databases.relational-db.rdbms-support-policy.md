# RDBMS version support policy

Defines Camunda’s official RDBMS support policy, including supported databases, LTS-based version rules, managed PostgreSQL guidance, JDBC driver expectations, and component compatibility.

Confirm which relational databases and versions Camunda supports for **Camunda 8 Self-Managed**, including lifecycle rules, managed PostgreSQL guidance, JDBC driver responsibilities, and component compatibility.


## Scope and applicability

This policy applies to:

- **Camunda 8 Self-Managed** deployments.

It covers relational databases used for:

- [Secondary storage for the Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index)
- [Camunda Hub](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database)

**Info**
Camunda follows an **"all LTS versions"** rule for database support. All listed database versions are official **LTS releases still supported by the vendor**. Camunda tests against both the **oldest** and **newest** supported version of each database in CI.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy
