# Multi-Region RDBMS — Architecture — Replication-agnostic secondary storage

Camunda uses one JDBC URL per Orchestration Cluster, through a connection pool on each broker, and the RDBMS exporter has no multi-region mode. As the [RDBMS multi-region support](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#multi-region-support) documentation states, multi-region replication must be handled within the database itself.

Multi-Region RDBMS adopts that constraint rather than working around it:

- Every broker in every region writes to the **same JDBC URL**.
- There are **no per-region exporters** to enable, disable, or reinitialize.
- Region loss desynchronizes nothing at the Camunda layer, so failback has no restore step.
- Swapping the database changes one value.

Any database that presents a single endpoint following its own writer fits. See [multi-region support](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#multi-region-support) for the supported databases. For example:

- A globally replicated managed database.
- A PostgreSQL cluster behind a floating endpoint.
- A connection proxy.
- A DNS record you repoint during failover.

Whichever mechanism you choose, test it with the [failover procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops) before you go to production.

The Camunda configuration does not change between them.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
