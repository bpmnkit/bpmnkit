# Configure secondary storage with Docker Compose — mariadb

Set the JDBC URL in the application configuration to `jdbc:mariadb://mariadb-secondary:3306/camunda_secondary?serverTimezone=UTC`.

```yaml
services:
  orchestration:
    depends_on:
      - mariadb-secondary
    networks:
      - secondary-storage

  mariadb-secondary:
    image: mariadb:11.4
    environment:
      MARIADB_DATABASE: camunda_secondary
      MARIADB_USER: camunda
      MARIADB_PASSWORD: camunda
      MARIADB_ROOT_PASSWORD: rootcamunda
    volumes:
      - mariadb-secondary-data:/var/lib/mysql
    networks:
      - secondary-storage

volumes:
  mariadb-secondary-data:

networks:
  secondary-storage:
```

```shell
# Lightweight setup
ORCHESTRATION_CONFIG_FILE=application-mariadb.yaml docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

# Full setup
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
