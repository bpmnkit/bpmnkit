# RDBMS version support policy — Managed PostgreSQL services

Camunda supports PostgreSQL as a database engine, not individual managed service implementations.

Managed PostgreSQL services are supported when:

- They are fully compatible with the PostgreSQL versions listed in this policy, and
- The service provider guarantees compatibility and support for those versions.

Provider-specific operational behavior and service characteristics remain the responsibility of the service provider.

Amazon Aurora PostgreSQL is listed separately because it is explicitly tested by Camunda, while other managed PostgreSQL services are supported based on compatibility guarantees provided by the service provider.


## New version support

New database versions are added based on the following criteria:

- **Vendor release:** The version must be officially released by the database vendor.
- **Availability window:** The version must be available at least three months before the next Camunda minor release.
- **Validation:** The version must be tested and validated across relevant Camunda components.

If the availability window is missed, support is deferred to a subsequent minor release.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy
