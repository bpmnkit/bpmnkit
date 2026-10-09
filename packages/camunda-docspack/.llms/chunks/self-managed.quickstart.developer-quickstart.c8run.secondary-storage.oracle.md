# Configure secondary storage in Camunda 8 Run — oracle

**Secondary storage config**

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:oracle:thin:@//localhost:1521/FREEPDB1
        username: camunda
        password: camunda
```

**Start database (Docker)**

```bash
docker run -d --name camunda-oracle \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=camunda \
  -e APP_USER=camunda \
  -e APP_USER_PASSWORD=camunda \
  gvenzl/oracle-free:23-slim
```

**Note**
Download the Oracle JDBC driver, for example `ojdbc11.jar`, and place it in `camunda-zeebe-<version>/lib` or pass `--extra-driver /path/to/ojdbc11.jar`.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
