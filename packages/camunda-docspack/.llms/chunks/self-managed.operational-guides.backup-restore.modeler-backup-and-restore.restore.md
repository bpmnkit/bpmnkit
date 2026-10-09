# Backup and restore Camunda Hub data — Restore

Backups can only be restored with downtime.
To restore the database dump, first ensure that Camunda Hub is stopped.
Then, to restore the database use the following command:

```bash
psql -U <DATABASE_USER> -h <DATABASE_HOST> -p <DATABASE_PORT> -f dump.psql <DATABASE_NAME>
```

After the database has been restored, you can start Camunda Hub again.

**Danger**
When restoring Camunda Hub data from a backup, ensure that the ids of the users stored in your OIDC provider (e.g. Keycloak) do not change in between the backup and restore.
Otherwise, users may not be able to access their projects after the restore (see [Camunda Hub's troubleshooting guide](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-missing-data)).

**Tip**
Some vendors provide tools that help with database backups and restores, such as [AWS Backup](https://aws.amazon.com/getting-started/hands-on/amazon-rds-backup-restore-using-aws-backup/) or [Cloud SQL backups](https://cloud.google.com/sql/docs/postgres/backup-recovery/backups).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/modeler-backup-and-restore
