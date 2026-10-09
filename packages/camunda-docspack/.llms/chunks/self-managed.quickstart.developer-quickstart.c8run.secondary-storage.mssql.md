# Configure secondary storage in Camunda 8 Run — mssql

**Secondary storage config**

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:sqlserver://localhost:1433;databaseName=camunda_secondary;encrypt=false
        username: camunda
        password: Camunda123!
```

**Start database (Docker)**

```bash
docker run -d --name camunda-mssql \
  -e ACCEPT_EULA=Y \
  -e MSSQL_SA_PASSWORD=Camunda123! \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
