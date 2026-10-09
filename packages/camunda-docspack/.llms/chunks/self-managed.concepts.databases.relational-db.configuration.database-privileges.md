# RDBMS configuration overview — Database privileges

The configured database user must have the following privileges on all Camunda tables:

- SELECT
- INSERT
- UPDATE
- DELETE

### Additional privileges for automatic schema management

If Liquibase schema management is enabled, the following privileges must be granted before the first startup:

- CREATE
- ALTER
- DROP

### Additional privilege for purge operations

If using the RDBMS purge feature, the following privilege is required:

- TRUNCATE


## Database driver

Camunda images include JDBC drivers for all supported databases except Oracle and MySQL.

If you use one of these databases, you must provide the driver yourself.

### Docker Compose

When running Camunda with Docker Compose, mount the driver into `/driver-lib`:

```yaml
services:
  camunda:
    image: camunda/camunda:<tag>
    volumes:
      - <local-path>/driver-lib:/driver-lib
```

Place the driver JAR directly inside the mounted directory (not in subfolders).

### Helm

When deploying with Helm, see [JDBC driver management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-jdbc-drivers).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
