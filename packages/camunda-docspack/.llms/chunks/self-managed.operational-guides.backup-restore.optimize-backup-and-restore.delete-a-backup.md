# Back up and restore Optimize independently — Delete a backup

To delete an existing backup and free storage, use the following API:

```bash
curl --request DELETE "$OPTIMIZE_MANAGEMENT_API/actuator/backups/$BACKUP_ID"
```

This removes all snapshots associated with the given backup ID from the configured snapshot repository.

A successful response returns `204 No Content`.

For the full API reference including response codes, see the [Optimize backup management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup#delete-backup-api).


## List existing backups

To list all available Optimize backups:

```bash
curl -s "$OPTIMIZE_MANAGEMENT_API/actuator/backups"
```

To retrieve information about a specific backup:

```bash
curl -s "$OPTIMIZE_MANAGEMENT_API/actuator/backups/$BACKUP_ID"
```

For the full API reference, see the [Optimize backup management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup#get-backup-info-api).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
