# Backup and restore overview — Operations blocked during restore

While restore is in progress, mutating cluster operations are blocked. This includes:

- Create backup
- Start another restore
- Create, update, or delete schedules
- Rename or delete cluster
- Upgrade cluster
- Sleep or wake cluster
- Change IP allowlists
- Change encryption key settings
- Change plan or hardware profile

These operations remain available:

- Delete a stored backup
- View backups and schedules
- Manage connector secrets
- Manage API clients
- View alerts


## API access

You can also initiate restore through the Administration API.

- Endpoint: `POST /api/orgs/:orgId/clusters/:clusterId/backups/:backupId/restore`
- Permission: `CreateHotBackups`

See the [Administration API reference](https://docs.camunda.io/docs/next/apis-tools/administration-api/administration-api-reference).

---
Source: https://docs.camunda.io/docs/next/components/saas/backup-restore-overview
