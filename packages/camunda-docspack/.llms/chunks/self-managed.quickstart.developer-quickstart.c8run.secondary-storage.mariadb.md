# Configure secondary storage in Camunda 8 Run — mariadb

**Secondary storage config**

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:mariadb://localhost:3306/camunda_secondary?serverTimezone=UTC
        username: camunda
        password: camunda
```

**Start database (Docker)**

```bash
docker run -d --name camunda-mariadb \
  -e MARIADB_USER=camunda \
  -e MARIADB_PASSWORD=camunda \
  -e MARIADB_ROOT_PASSWORD=rootcamunda \
  -e MARIADB_DATABASE=camunda_secondary \
  -p 3306:3306 mariadb:11.4
```

**Note**
No extra driver is required. MariaDB ships with the distribution.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
