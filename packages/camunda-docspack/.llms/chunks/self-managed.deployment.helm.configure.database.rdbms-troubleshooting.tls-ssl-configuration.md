# RDBMS troubleshooting and operations — TLS/SSL configuration

### postgresql

Add SSL parameters to the JDBC URL:

```yaml
orchestration:
  data:
    secondaryStorage:
      rdbms:
        url: jdbc:postgresql://hostname:5432/camunda?ssl=true&sslmode=require
```

### oracle

Oracle uses TCPS (TLS over Oracle protocol):

```yaml
orchestration:
  data:
    secondaryStorage:
      rdbms:
        url: jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS=(PROTOCOL=TCPS)(HOST=hostname)(PORT=2484))(CONNECT_DATA=(SERVICE_NAME=FREEPDB1)))
```

### mssql

SQL Server enables encryption via the JDBC URL:

```yaml
orchestration:
  data:
    secondaryStorage:
      rdbms:
        url: jdbc:sqlserver://hostname:1433;databaseName=camunda;encrypt=true;trustServerCertificate=false
```

### mariadb

MariaDB and MySQL enable SSL via the JDBC URL:

```yaml
orchestration:
  data:
    secondaryStorage:
      rdbms:
        # MariaDB
        url: jdbc:mariadb://hostname:3306/camunda?sslMode=verify-full
        # MySQL
        url: jdbc:mysql://hostname:3306/camunda?useSSL=true&requireSSL=true
```

### Self-signed certificates

If your database uses self-signed certificates:

1. Extract the certificate from your database server.
2. Create a Kubernetes secret:

```bash
kubectl create secret generic db-certs \
  --from-file=ca.crt=/path/to/ca.crt \
  -n camunda
```

3. Mount the certificate and configure trust (consult your database vendor's JDBC documentation).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
