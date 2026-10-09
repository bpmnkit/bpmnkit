# Deploy required dependencies with Kubernetes operators — Migrate an existing single-instance deployment — Reclaim the space later

The migration leaves `storage.size` untouched, so your data volumes keep their existing size. If 15Gi is more than your databases need, note that CloudNativePG rejects lowering `storage.size` on a live cluster. Reducing it is a supervised procedure that recreates each instance on a smaller volume, described in [Volume reduction](https://cloudnative-pg.io/docs/1.30/storage/#volume-reduction).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
