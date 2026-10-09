# Operations and maintenance for RDBMS manual installations — Schema upgrades

1. Backup your database.
2. Download scripts for target version: [access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).
3. **If using autoDDL (default)**: Liquibase runs on Zeebe startup.
4. **If using manual schema management**: Apply scripts manually, then start new Camunda version.


## Disabling automatic schema updates

For strict change control environments:

```bash
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_AUTO_DDL=false
```

DBA must apply schema changes manually using scripts. Zeebe fails to start if schema is out of date.


## Verification and troubleshooting

### Success indicators

**Liquibase migration complete:**

```
[INFO] io.camunda.application.commons.rdbms.MyBatisConfiguration - Initializing Liquibase for RDBMS with global table trimmedPrefix ''.
```

No errors in Liquibase logs means migration was successful.

**RdbmsExporter running:**

```
[INFO] io.camunda.exporter.rdbms.RdbmsExporter - [RDBMS Exporter] RdbmsExporter created with Configuration: flushInterval=PT0.5S, queueSize=1000
[INFO] io.camunda.exporter.rdbms.RdbmsExporter - [RDBMS Exporter] Exporter opened with last exported position 126
```

No errors in RdbmsExporter logs means the exporter is healthy. For more details about exported records, enable DEBUG log level.

### Common failure modes

| Symptom                                                      | Root cause                      | Fix                                                   |
| ------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------- |
| `SQLNonTransientConnectionException: Socket fail to connect` | Invalid URL or unreachable host | Verify JDBC URL format and hostname/port resolution   |
| `SQLInvalidAuthorizationSpecException: Access denied`        | Wrong credentials               | Check username/password and database user permissions |
| `Failed to load driver class oracle.jdbc.OracleDriver`       | Missing JDBC driver             | Verify driver JAR in `/driver-lib` or classpath       |
| `Table 'camunda.EXPORTER_POSITION' doesn't exist`            | autoDDL=false on empty DB       | Run schema initialization scripts manually            |

**All failure modes above prevent Camunda startup.**

### Auto-DDL behavior

When started with `auto-ddl=false` on an empty database, the RdbmsExporter throws errors like:

```
### Error querying database. Cause: java.sql.SQLSyntaxErrorException: (conn=3) Table 'camunda.EXPORTER_POSITION' doesn't exist
### The error may exist in URL [jar:file:.../camunda-db-rdbms-8.9.0-SNAPSHOT.jar!/mapper/ExporterPositionMapper.xml]
### The error occurred while setting parameters
### SQL: SELECT PARTITION_ID, EXPORTER, LAST_EXPORTED_POSITION, CREATED, LAST_UPDATED FROM EXPORTER_POSITION WHERE PARTITION_ID = ?
### Cause: java.sql.SQLSyntaxErrorException: (conn=3) Table 'camunda.EXPORTER_POSITION' doesn't exist
```

**Solution**: Run schema initialization scripts manually using the bundled SQL or Liquibase scripts before starting Camunda.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/operations
