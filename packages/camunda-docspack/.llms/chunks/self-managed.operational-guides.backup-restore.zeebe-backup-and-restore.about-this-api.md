# Zeebe backup management API — About this API

A backup of a Zeebe cluster comprises a consistent snapshot of all partitions. The backup is taken asynchronously in the background while Zeebe is processing. Thus, backups can be taken with minimal impact on typical processing. Backups can be used to restore a cluster in case of failures that lead to full data loss or data corruption, and form the basis of [Cold Recovery](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery) for cross-region disaster recovery.

Zeebe provides a REST API to create, query, and manage backups.
The backup management API is a custom endpoint `backups`, available via [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/2.7.x/reference/htmlsingle/#actuator.endpoints). It is accessible via the management port of the Zeebe Gateway. The API documentation is also available as an [OpenAPI specification](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/backup-management-api.yaml).

**Warning**
Usage of this API requires the backup store to be configured for the component.

- [Zeebe configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackup)

To use the backup feature in Zeebe, you must choose which external storage system you will use.
Make sure to set the same configuration on all brokers in your cluster.

Zeebe supports [S3](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackups3), [Google Cloud Storage (GCS)](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackupgcs), and [Azure](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackupazure), and [local filesystem](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackupfilesystem) for external storage.

**Caution**
Backups created with one store are not available in or restorable from another store.

This is especially relevant if you were using GCS through the S3 compatibility mode and want to switch to the new built-in support for GCS now.
Even when the underlying storage bucket is the same, backups from one are not compatible with the other.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
