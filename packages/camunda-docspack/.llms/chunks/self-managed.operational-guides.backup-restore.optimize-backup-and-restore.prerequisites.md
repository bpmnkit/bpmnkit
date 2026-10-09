# Back up and restore Optimize independently — Prerequisites

Before creating a backup, complete the following setup:

| Prerequisite                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot repository           | Register a snapshot repository with Elasticsearch or OpenSearch. See [Elasticsearch snapshot repository](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/manage-snapshot-repositories) or [OpenSearch snapshot repository](https://docs.opensearch.org/docs/latest/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore/).                                                                                                                                                                        |
| Optimize backup configuration | Configure the repository name in Optimize using the `CAMUNDA_OPTIMIZE_BACKUP_REPOSITORY_NAME` environment variable, or by adding it to your Optimize [`environment-config.yaml`](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration). See [Elasticsearch backup settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#elasticsearch-backup-settings) or [OpenSearch backup settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#opensearch-backup-settings). |

**Note**
The management API is accessible via the management port (default `8092`). Direct access is required — the management port is not publicly exposed. In Kubernetes, use [port-forwarding](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_port-forward/) or [exec](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_exec/).

```bash
# Port-forwarding example (Kubernetes)
kubectl port-forward services/camunda-optimize 8092:8092
```

**Note**
The configured `contextPath` does not apply to the management port. Setting `contextPath` in the Camunda Helm chart for Optimize will not change the management API path, which remains at `/`.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
