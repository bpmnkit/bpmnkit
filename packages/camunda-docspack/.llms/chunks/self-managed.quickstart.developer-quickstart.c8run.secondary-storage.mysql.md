# Configure secondary storage in Camunda 8 Run — mysql

**Secondary storage config**

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:mysql://localhost:3307/camunda_secondary?serverTimezone=UTC
        username: camunda
        password: camunda
```

**Start database (Docker)**

```bash
docker run -d --name camunda-mysql \
  -e MYSQL_ROOT_PASSWORD=rootcamunda \
  -e MYSQL_USER=camunda \
  -e MYSQL_PASSWORD=camunda \
  -e MYSQL_DATABASE=camunda_secondary \
  -p 3306:3306 mysql:9.7
```

**Note**
MySQL requires the official Connector/J driver. Copy the JAR into `camunda-zeebe-<version>/lib` or pass `--extra-driver /path/to/mysql-connector.jar` to `./c8run start`.

Ensure the JDBC URL uses the host port you expose.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
