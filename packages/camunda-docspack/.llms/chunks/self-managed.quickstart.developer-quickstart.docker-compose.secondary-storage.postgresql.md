# Configure secondary storage with Docker Compose — postgresql

Set the JDBC URL in the application configuration to `jdbc:postgresql://postgres-secondary:5432/camunda_secondary`.

```yaml
services:
  orchestration:
    depends_on:
      - postgres-secondary
    networks:
      - secondary-storage

  postgres-secondary:
    image: postgres:16
    environment:
      POSTGRES_DB: camunda_secondary
      POSTGRES_USER: camunda
      POSTGRES_PASSWORD: camunda
    volumes:
      - postgres-secondary-data:/var/lib/postgresql/data
    networks:
      - secondary-storage

volumes:
  postgres-secondary-data:

networks:
  secondary-storage:
```

```shell
# Lightweight setup
ORCHESTRATION_CONFIG_FILE=application-postgresql.yaml docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

# Full setup
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
