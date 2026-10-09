# Restore a backup with the Restore Application (RDBMS)

Learn how to restore a Camunda 8 Self-Managed backup with the legacy Zeebe Restore Application when using a relational database, including all restore options.

Restore Zeebe partition data with the legacy Restore Application, a standalone app that runs on each broker node while all Camunda components are stopped, when using a relational database management system (RDBMS) as secondary storage.

This page is part of the RDBMS [restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore). With Camunda 8.10 and later, you can use the [Restore API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api) instead, which does not require restarting the brokers. To compare the two, see [choosing a restore approach](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#choosing-a-restore-approach).

After you ensure all [prerequisites](#prerequisites) are met, the procedure consists of the following steps:

1. [Stop all Camunda components](#stop-all-camunda-components).
2. [Restore the RDBMS](#restore-rdbms) using your database vendor's native tools.
3. [Restore Zeebe](#restore-zeebe) from its primary storage backup using one of the [restore options](#restore-options).
4. [Start all Camunda 8 components](#start-all-camunda-8-components).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
