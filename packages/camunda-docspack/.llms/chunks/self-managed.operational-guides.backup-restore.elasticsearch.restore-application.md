# Restore a backup with the Restore Application

Learn how to restore a Camunda 8 Self-Managed backup with the legacy Zeebe Restore Application when using Elasticsearch or OpenSearch.

Restore Zeebe partition data with the legacy Restore Application, a standalone app that runs on each broker node while all Camunda components are stopped, when using Elasticsearch or OpenSearch as secondary storage.

This page is part of the Elasticsearch/OpenSearch [restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore). With Camunda 8.10 and later, you can use the [Restore API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api) instead, which does not require restarting the brokers.


## Prerequisites

In addition to the [general restore prerequisites](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore#prerequisites), the Restore Application requires the following:

| Prerequisite       | Description                                                                                                                                                                       |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backup storage     | Zeebe and Elasticsearch/OpenSearch are configured with the same backup storage and snapshot repository used to create the backup. See [prerequisites](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup#prerequisites). |
| Sizing             | Elasticsearch/OpenSearch should be sized the same or larger than the original cluster; a smaller cluster can prevent shards from being assigned and fail the restore.             |
| Components stopped | No Camunda component may be running during the restore. A running component can propagate an incorrect cluster configuration and disrupt cluster communication.                   |

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
