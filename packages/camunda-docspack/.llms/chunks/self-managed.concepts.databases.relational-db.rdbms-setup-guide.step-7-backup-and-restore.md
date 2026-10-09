# End-to-end RDBMS setup guide — Step 7: Backup and restore

Both components require RDBMS backups:

- **Orchestration Cluster**: Zeebe exports data to RDBMS; backups are DBA responsibility.
- **Camunda Hub**: All data stored in RDBMS; backups are DBA responsibility.

Use vendor-native tools: PostgreSQL (`pg_dump`), MariaDB/MySQL (`mysqldump`), SQL Server (native backup), Oracle (RMAN).

Test restore procedures in non-production environments regularly.


## Related guides

- [Secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index)
- [RDBMS example deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms)
- [Operations and maintenance](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/operations)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide
