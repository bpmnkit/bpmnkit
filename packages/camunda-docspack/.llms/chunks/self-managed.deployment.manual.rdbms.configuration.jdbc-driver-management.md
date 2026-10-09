# Configure RDBMS for manual installations — JDBC driver management

### Bundled drivers

Camunda bundles these JDBC drivers for redistribution:

| Database             | Driver artifact                        |
| -------------------- | -------------------------------------- |
| PostgreSQL           | `org.postgresql:postgresql`            |
| MariaDB              | `org.mariadb.jdbc:mariadb-java-client` |
| Microsoft SQL Server | `com.microsoft.sqlserver:mssql-jdbc`   |
| H2                   | `com.h2database:h2`                    |
| AWS Aurora JDBC      | Bundled                                |

You can optionally supply your own version of any bundled driver for flexibility or compliance requirements.

### User-supplied drivers (Oracle, MySQL)

**Recommended approach**: Place drivers in `/opt/camunda-drivers` and set CLASSPATH:

```bash
export CLASSPATH="/opt/camunda-drivers/*:$CLASSPATH"
./camunda.sh
```

For Docker, mount external drivers using a volume. The driver JAR must be placed directly in the mounted directory (no subdirectories):

```yaml
services:
  camunda:
    image: camunda/camunda-platform:8.9.0
    ports:
      - "8080:8080"
      - "26500:26500"
      - "9600:9600"
    environment:
      CAMUNDA_DATA_SECONDARY_STORAGE_TYPE: rdbms
      CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_URL: jdbc:mysql://mysql:3306/camunda
      CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_USERNAME: camunda
      CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_PASSWORD: demo
    volumes:
      - /path/to/driver-lib:/driver-lib
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration
