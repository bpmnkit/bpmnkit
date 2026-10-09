# Camunda backup creation (Elasticsearch/OpenSearch)

Learn how to back up your Camunda 8 Self-Managed components using Elasticsearch or OpenSearch.

Back up your Camunda 8 Self-Managed components and cluster.

### Prerequisites

The following prerequisites are required before you can create a backup.

| Prerequisite                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Set up a snapshot repository in the secondary datastore. | Configure a snapshot repository on the datastore itself:[Elasticsearch snapshot repository](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/manage-snapshot-repositories)[OpenSearch snapshot repository](https://docs.opensearch.org/docs/latest/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore/)Note: For Elasticsearch configuration with the Camunda Helm chart on AWS EKS using IRSA, see [configuration example](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa#backup-related). |
| Configure component backup storage.                      | Configure the backup storage for the following components. This is also important for restoring a backup.[Operate](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/operate/operate-configuration#backups)[Optimize Elasticsearch](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#elasticsearch-backup-settings) / [Optimize OpenSearch](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#opensearch-backup-settings)[Tasklist](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-configuration#backups) |
| Configure Zeebe backup storage.                          | Configure the backup storage for Zeebe. This is required regardless of your secondary storage choice. See [Zeebe backup configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackup).                                                                                                                                                                                                                                                                                                                                                                                   |

**Note**
You should keep the backup storage of the components configured at all times to ease the backup and restore process and avoid unnecessary restarts.

**Tip**
You can use the same backup storage location for both Elasticsearch / OpenSearch snapshots and Zeebe partition backups, as long as different paths are configured:

- Set the `basePath` for Zeebe.
- Set the `base_path` for Elasticsearch / OpenSearch.

To learn more about how to configure these settings, refer to the prerequisites linked documentation above.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
