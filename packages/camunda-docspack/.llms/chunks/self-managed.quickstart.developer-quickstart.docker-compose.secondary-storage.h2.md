# Configure secondary storage with Docker Compose — h2

H2 is the default secondary storage backend in both application configuration files. You don't need a `docker-compose.override.yaml` file.

```shell
# Lightweight setup
docker compose up -d

# Full setup
docker compose -f docker-compose-full.yaml up -d
```

Use H2 only for development, testing, and evaluation. It is not a production backend.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
