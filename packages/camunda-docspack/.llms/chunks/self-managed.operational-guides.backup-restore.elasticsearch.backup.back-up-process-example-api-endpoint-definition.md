# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — Example API endpoint definition

**Note**

This depends heavily on your setup. The following examples are based on those given in the [REST API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#rest-api) and [Management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#management-api) sections for Kubernetes using either active port-forwarding or an override of the local `curl` command.

The REST API (`ORCHESTRATION_CLUSTER_API`) is the same authenticated Orchestration Cluster API you use for everything else; the management API (`ORCHESTRATION_CLUSTER_MANAGEMENT_API`) is typically not publicly exposed and needs direct access within your environment. Optimize has no REST equivalent, so `OPTIMIZE_MANAGEMENT_API` is always required.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
