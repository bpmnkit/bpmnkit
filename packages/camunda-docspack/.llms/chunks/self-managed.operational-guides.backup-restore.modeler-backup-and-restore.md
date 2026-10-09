# Backup and restore Camunda Hub data

How to perform a backup and restore of Camunda Hub data.

Back up and restore Camunda Hub independently of the Orchestration Cluster.


## Create backup

To create a backup of Camunda Hub data, you must back up the database that Camunda Hub uses by following the instructions of the official [PostgreSQL documentation](https://www.postgresql.org/docs/current/backup-dump.html).

For example, to create a backup of the database using `pg_dumpall`, use the following command:

```bash
pg_dumpall -U <DATABASE_USER> -h <DATABASE_HOST> -p <DATABASE_PORT> -f dump.psql --quote-all-identifiers
Password: <DATABASE_PASSWORD>
```

`pg_dumpall` may ask multiple times for the same password.
The database will be dumped into `dump.psql`.

**Note**
Database dumps created with `pg_dumpall`/`pg_dump` can only be restored into a database with the same or later version of PostgreSQL, see [PostgreSQL documentation](https://www.postgresql.org/docs/current/app-pgdump.html#PG-DUMP-NOTES).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/modeler-backup-and-restore
