# Multi-region setup with RDBMS (EKS) — 1. Configure AWS and apply Terraform — Bring your own database

To run this architecture on a database other than Aurora Global Database, set `deploy_database = false` and supply your own JDBC URL through `CAMUNDA_RDBMS_URL`. Anything that presents a single endpoint following its own writer works the same way. Examples are a PostgreSQL cluster behind a floating endpoint, a connection proxy, or a DNS record you repoint during failover.

The generated Helm values use the `LOG_SEQ` replication strategy, which fails at startup on a backend without LSN support. For such a backend, see [replication-agnostic secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms#replication-agnostic-secondary-storage) to choose `DELAY` instead.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
