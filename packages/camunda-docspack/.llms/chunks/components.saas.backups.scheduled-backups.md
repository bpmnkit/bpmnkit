# Backups — Scheduled backups

Scheduled backups are created periodically (e.g daily, weekly). They are configured to run automatically on the scheduled time.

### Retention

A backup schedule retains the last five successful and failed backups. Failed backups are retained to allow further root-cause analysis for backup failures. If a backup fails, it is not retried immediately as the failure can lead to instability.

**Note**
If you require more retained backups or more frequent backups, [contact Camunda support](https://camunda.com/services/support/) to discuss your specific needs.


## Programmatic access

The backup operations can be performed programmatically using the Administration API.
This provides the flexibility to seamlessly integrate backup-related tasks with your existing systems and automation workflows.
For detailed information on using the API, refer to the [Administration API reference](https://docs.camunda.io/docs/next/apis-tools/administration-api/administration-api-reference).

---
Source: https://docs.camunda.io/docs/next/components/saas/backups
