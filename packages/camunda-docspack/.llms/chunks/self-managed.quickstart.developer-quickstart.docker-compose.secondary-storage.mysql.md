# Configure secondary storage with Docker Compose — mysql

Set the JDBC URL in the application configuration to `jdbc:mysql://mysql-secondary:3306/camunda_secondary?serverTimezone=UTC`.

```yaml
services:
  orchestration:
    depends_on:
      - mysql-secondary
    volumes:
      - ./driver-lib:/driver-lib:ro
    networks:
      - secondary-storage

  mysql-secondary:
    image: mysql:9.7
    environment:
      MYSQL_DATABASE: camunda_secondary
      MYSQL_USER: camunda
      MYSQL_PASSWORD: camunda
      MYSQL_ROOT_PASSWORD: rootcamunda
    volumes:
      - mysql-secondary-data:/var/lib/mysql
    networks:
      - secondary-storage

volumes:
  mysql-secondary-data:

networks:
  secondary-storage:
```

```shell
# Lightweight setup
ORCHESTRATION_CONFIG_FILE=application-mysql.yaml docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

# Full setup
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d
```

Place the MySQL Connector/J JAR directly in `driver-lib/` before you start either setup.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
