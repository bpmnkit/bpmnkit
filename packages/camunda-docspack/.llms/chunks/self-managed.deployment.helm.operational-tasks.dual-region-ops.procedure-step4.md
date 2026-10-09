# Helm chart dual-region operational procedure — Procedure — step4

#### Create and restore Elasticsearch backup

| **Details**                          | **Current State**                                                                                                                                | **Desired State**                                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Camunda 8**_(Zeebe Cluster)_ | Reachable by end-users but not processing any new process instances nor reflecting User changes. This state allows for data backup without loss. | Remain not processing any new instances nor processing user inputs.                                                                                                                   |
| **Elasticsearch Backup**             | No backup is in progress.                                                                                                                        | Backup of Elasticsearch in the surviving region is initiated and being restored in the recreated region, containing all necessary data. The backup process may take time to complete. |

#### How to get there

This builds on top of the [AWS setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region) and assumes the S3 bucket was automatically created as part of the Terraform execution.

**Info**

The procedure works for other Cloud providers and bare metal. You have to adjust the AWS S3-specific part depending on your chosen backup source for Elasticsearch. Consult the [Elasticsearch documentation on snapshot and restore](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html) to learn more about this, and specifically the [different supported types](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshots-register-repository.html#ess-repo-types) by Elasticsearch.

1. Determine the S3 bucket

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
