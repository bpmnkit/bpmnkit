# Configure secondary storage in Camunda 8 Run — postgresql

**Secondary storage config**

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:postgresql://localhost:5432/camunda_secondary
        username: camunda
        password: camunda
```

**Start database (Docker)**

```bash
docker run -d --name camunda-postgres \
  -e POSTGRES_USER=camunda \
  -e POSTGRES_PASSWORD=camunda \
  -e POSTGRES_DB=camunda_secondary \
  -p 5432:5432 postgres:latest
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
