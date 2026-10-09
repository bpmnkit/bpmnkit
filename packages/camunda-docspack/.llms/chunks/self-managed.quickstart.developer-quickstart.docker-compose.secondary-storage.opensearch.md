# Configure secondary storage with Docker Compose — opensearch

```yaml
services:
  orchestration:
    environment:
      CAMUNDA_DATA_SECONDARY_STORAGE_TYPE: opensearch
      CAMUNDA_DATA_SECONDARY_STORAGE_OPENSEARCH_URL: http://opensearch-secondary:9200
    depends_on:
      - opensearch-secondary
    networks:
      - secondary-storage

  opensearch-secondary:
    image: opensearchproject/opensearch:2.19.3
    environment:
      discovery.type: single-node
      OPENSEARCH_JAVA_OPTS: -Xms512m -Xmx512m
      DISABLE_SECURITY_PLUGIN: "true"
    volumes:
      - opensearch-secondary-data:/usr/share/opensearch/data
    networks:
      - secondary-storage

volumes:
  opensearch-secondary-data:

networks:
  secondary-storage:
```

```shell
# Lightweight setup
docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

# Full setup, with a separate Elasticsearch endpoint configured in .env
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
