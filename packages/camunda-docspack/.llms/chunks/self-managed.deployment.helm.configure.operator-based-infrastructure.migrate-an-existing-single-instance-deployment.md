# Deploy required dependencies with Kubernetes operators — Migrate an existing single-instance deployment

Deployments created before the high availability defaults run one instance per PostgreSQL cluster, with `pg_wal` inside the data volume. Moving them to the current defaults is an in-place change: CloudNativePG clones a second instance from the running primary and relocates `pg_wal` onto its new volume by itself. You do not dump, restore, or recreate anything.

Plan for one short interruption per cluster. CloudNativePG applies the new pod specification as a [rolling update](https://cloudnative-pg.io/docs/1.30/rolling_update/): replicas first, the primary last. With the default `primaryUpdateMethod: restart`, the primary restarts in place, which interrupts open connections to that cluster for a few seconds. The clusters migrate independently, so the interruptions do not have to happen at the same time.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
