# Configure secondary storage with Docker Compose — elasticsearch

```yaml
services:
  orchestration:
    environment:
      CAMUNDA_DATA_SECONDARY_STORAGE_TYPE: elasticsearch
      CAMUNDA_DATA_SECONDARY_STORAGE_ELASTICSEARCH_URL: http://elasticsearch-secondary:9200
      CAMUNDA_DATA_SECONDARY_STORAGE_ELASTICSEARCH_USERNAME: ""
      CAMUNDA_DATA_SECONDARY_STORAGE_ELASTICSEARCH_PASSWORD: ""
    depends_on:
      - elasticsearch-secondary
    networks:
      - secondary-storage

  elasticsearch-secondary:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.19.11
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: -Xms512m -Xmx512m
    volumes:
      - elasticsearch-secondary-data:/usr/share/elasticsearch/data
    networks:
      - secondary-storage

volumes:
  elasticsearch-secondary-data:

networks:
  secondary-storage:
```

```shell
# Lightweight setup
docker compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

# Full setup
docker compose -f docker-compose-full.yaml -f docker-compose.override.yaml up -d
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
