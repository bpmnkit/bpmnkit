# Camunda backup creation (Elasticsearch/OpenSearch) — About the backup process

To create a backup, complete the following [backup process](#back-up-process).

**Note**
Steps that changed with Camunda 8.10 show both APIs. Use the REST API by default. The management (actuator) API remains available as a backward-compatible alternative for existing automation. See [REST API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#rest-api) for the concepts shared across steps, including how each management API call maps to its REST equivalent.

You can also optionally [back up your Camunda Hub data](#back-up-hub-data).

**Caution: before you begin**

- To create a consistent backup, you **must** complete the steps in the order outlined below.
- You must complete the [prerequisites](#prerequisites) before creating a backup.

### Physical Tenants

The REST steps below are scoped to whichever Physical Tenant your credentials belong to. The actuator calls apply cluster-wide instead, so following the actuator alternative as written backs up every Physical Tenant at once.

To back up a specific tenant other than your own, or every tenant in one call with per-tenant outcome reporting, use the cluster-wide REST endpoints described in [back up a cluster with multiple Physical Tenants](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#multiple-physical-tenants). There is no actuator equivalent for targeting a specific Physical Tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
