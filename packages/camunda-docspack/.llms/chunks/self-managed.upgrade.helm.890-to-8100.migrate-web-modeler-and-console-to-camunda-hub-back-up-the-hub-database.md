# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Back up the Hub database

Create a vendor-native backup of the Hub database after Hub is quiesced. This backup is the recovery point if migration fails or you must return to 8.9. Use the backup tool for your database platform, such as `pg_dump` for PostgreSQL. See [RDBMS backup and restore guidance](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide#step-7-backup-and-restore).

Do not continue until you have confirmed the Hub database backup can be restored.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
