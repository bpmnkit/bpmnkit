# Configure secondary storage

Learn how to configure secondary storage in Camunda Self-Managed environments using Helm, Docker, or manual deployment.

Configure secondary storage to enable features such as Operate, Tasklist, Identity, and search-based REST APIs in Camunda Self-Managed environments.

Use "secondary storage" as the general concept. The backend can be a supported RDBMS or a document-store backend such as Elasticsearch or OpenSearch, depending on your deployment requirements.


## Configuration options

You can configure secondary storage using Helm charts, Docker Compose, or manual configuration files.

Camunda uses the `data.secondary-storage` configuration to define which secondary storage backend supports Orchestration Cluster web applications and APIs (for example, Operate, Tasklist, Identity, and search endpoints).

Once a selection is made and the cluster is deployed, the secondary storage backend is fixed. Switching between backend families (document-store and RDBMS) or migrating between backends within the same family is not supported.

**Note**
For the latest list of supported relational databases and versions, see the  
[RDBMS version support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

### helm

When deploying with Helm, set the secondary storage type, connection details, and exporter settings in your `values.yaml` file.

```yaml
orchestration:
  exporters:
    camunda:
      enabled: false
    rdbms:
      enabled: true
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:postgresql://hostname:5432/camunda
        username: camunda
        secret:
          existingSecret: camunda-db-secret
          existingSecretKey: password
```

More information about RDBMS in the Camunda Helm chart can be found on this [configuration page](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

If you choose Elasticsearch as the secondary storage backend, configure it as follows:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        url: http://hostname:443
        auth:
          username: elastic
          secret:
            existingSecret: camunda-db-secret
            existingSecretKey: password
```

More information about Elasticsearch in the Camunda Helm chart can be found in [using external Elasticsearch](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch).

To explicitly disable secondary storage (for example, when running only the Zeebe engine), set:

```yaml
global:
  noSecondaryStorage: true
```

When this flag is set, all secondary-storage-dependent components are automatically disabled.

### docker-compose

If you’re using Docker Compose, configure your environment variables within the relevant service definition. The examples below use the `CAMUNDA_DATA_SECONDARY_STORAGE_*` naming family consistently.

```yaml
environment:
  - CAMUNDA_DATA_SECONDARY_STORAGE_TYPE=rdbms
  - CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_URL=jdbc:postgresql://postgres:5432/camunda
  - CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_USERNAME=camunda
  - CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_PASSWORD=camunda
```

If you choose Elasticsearch as the secondary storage backend:

```yaml
environment:
  - CAMUNDA_DATA_SECONDARY_STORAGE_TYPE=elasticsearch
  - CAMUNDA_DATA_SECONDARY_STORAGE_ELASTICSEARCH_URL=http://elasticsearch:9200
```

If you choose OpenSearch as the secondary storage backend:

```yaml
environment:
  - CAMUNDA_DATA_SECONDARY_STORAGE_TYPE=opensearch
  - CAMUNDA_DATA_SECONDARY_STORAGE_OPENSEARCH_URL=http://opensearch:9200
```

To disable secondary storage:

```yaml
environment:
  - CAMUNDA_DATA_SECONDARY_STORAGE_TYPE=none
```

For end-to-end backend-specific examples, including PostgreSQL, MariaDB, MySQL, Oracle, SQL Server, H2, Elasticsearch, and OpenSearch, see the [Docker Compose developer quickstart](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose).

### manual

In Self-Managed or Camunda 8 Run deployments, you can also configure storage directly in the `application.yaml` file:

```yaml
data:
  secondary-storage:
    type: rdbms
    rdbms:
      url: jdbc:h2:file:./camunda-data/h2db
      username: sa
      password:
```

If you choose Elasticsearch as the secondary storage backend:

```yaml
data:
  secondary-storage:
    type: elasticsearch
    elasticsearch:
      url: http://localhost:9200/
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage
