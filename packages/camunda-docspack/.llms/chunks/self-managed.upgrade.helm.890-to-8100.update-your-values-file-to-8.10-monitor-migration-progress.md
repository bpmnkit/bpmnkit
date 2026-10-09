# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Monitor migration progress

There are two ways to monitor the migration status of the orchestration cluster:

#### Public Cluster API

The public Cluster API endpoint for [upgrade readiness](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-cluster-upgrade-status.api), `/cluster/v2/status/upgrade`, returns the overall upgrade-readiness status.

```json
{
  "status": "MIGRATED"
}
```

#### Management API

The [Management API endpoint for upgrade readiness](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#upgrade-readiness-api) returns more detail about the overall upgrade status, including details for each physical tenant and condition.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
