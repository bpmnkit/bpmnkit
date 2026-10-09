# Version upgrade — Upgrade the application

To upgrade the application, start the new version's executable, pointing it at the same database the old version used.

**Info**
Camunda strongly recommends you [back up your database](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/modeler-backup-and-restore) before performing a version upgrade. If the migration does not complete successfully, you can use a backup to restore the previous version's data.


## Database migration

Camunda Hub uses [Flyway](https://www.red-gate.com/products/flyway/community/) to migrate its database schema from one version to another.
It applies changes incrementally, determined automatically from the specific version gap.
The migration is performed during application startup, before any HTTP traffic is served.

You can monitor the applied changes and their progress in the application logs. For example:

```text
[2026-09-11 15:05:05.794] [main] INFO
	org.flywaydb.core.internal.command.DbValidate - Successfully validated 167 migrations (execution time 00:00.116s)
[2026-09-11 15:05:05.808] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Current version of schema "public": 20260826.3
[2026-09-11 15:05:06.401] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Migrating schema "public" to version "20260827.1 - create hub projects and backfill"
[2026-09-11 15:05:06.427] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Migrating schema "public" to version "20260827.2 - drop process applications"
[2026-09-11 15:05:06.443] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Migrating schema "public" to version "20260827.3 - add hub project id indexes" [non-transactional]
[2026-09-11 15:05:06.460] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Migrating schema "public" to version "20260827.4 - add migration diff indexes" [non-transactional]
[2026-09-11 15:05:06.487] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Migrating schema "public" to version "20260828 - drop milestones legacy pa version fk idx and columns"
[2026-09-11 15:05:06.501] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Successfully applied 33 migrations to schema "public", now at version v20260828 (execution time 00:00.380s)
```

In the Flyway logs, you'll see:

1. The initial schema version.
2. The applied migrations.
3. The outcome of the migration.

Following these logs, you can review how far the migration has advanced and whether it completes successfully. If the migration fails, the application will exit and not serve any traffic.

Since the migration runs during application startup, the [readiness and liveness probes](https://docs.camunda.io/docs/next/self-managed/components/hub/monitoring#restapi) only report healthy after:

1. The migration has completed successfully.
2. The application has fully started.

If the migration fails, the application exits before the probes become reachable at all.

### Duration

If you employ automated liveness checks that can trigger application restarts, take into account that database migrations can run for a time that exceeds your liveness probe's timeout.
This depends on the concrete version gap as well as the size and resources of your database.
Camunda recommends performing the migration on a test system of similar specification first, so you can measure the actual migration duration and adjust your liveness probe timeout if needed.

### Database lock

Only one application instance needs to perform the database migration.
Once the schema is migrated, any number of instances can work with it.
To prevent multiple application instances attempting the migration simultaneously, Flyway acquires a pessimistic database lock before starting the migration.
If two application instances attempt the migration at the same time, the first one acquires the lock and begins the migration procedure.
The second instance is blocked until the first instance has completed the migration and releases the lock.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/version-upgrade
