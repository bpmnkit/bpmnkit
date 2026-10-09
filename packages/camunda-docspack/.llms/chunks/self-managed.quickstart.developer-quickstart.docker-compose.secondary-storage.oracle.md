# Configure secondary storage with Docker Compose — oracle

Set the JDBC URL in the application configuration to `jdbc:oracle:thin:@//oracle-secondary:1521/FREEPDB1`.

```yaml
services:
  orchestration:
    depends_on:
      - oracle-secondary
    volumes:
      - ./driver-lib:/driver-lib:ro
    networks:
      - secondary-storage

  oracle-secondary:
    image: gvenzl/oracle-free:23-slim
    environment:
      ORACLE_PASSWORD: oracle
      APP_USER: camunda
      APP_USER_PASSWORD: camunda
    volumes:
      - oracle-secondary-data:/opt/oracle/oradata
    networks:
      - secondary-storage

volumes:
  oracle-secondary-data:

networks:
  secondary-storage:
```

```shell
# Lightweight setup
ORCHESTRATION_CONFIG_FILE=application-oracle.yaml docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

# Full setup
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d
```

Place the Oracle JDBC driver JAR directly in `driver-lib/` before you start either setup.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
