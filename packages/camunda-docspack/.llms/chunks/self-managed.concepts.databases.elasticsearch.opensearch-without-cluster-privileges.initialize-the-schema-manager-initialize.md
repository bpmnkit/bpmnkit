# OpenSearch without cluster privileges — Initialize the schema manager {#initialize}

The schema manager is a separate Java application responsible for creating and managing the database schema and applying index template settings (for example, shard/replica counts and retention policies).

**Note**

- Initialization requires a user with cluster-level privileges. For example, use an OpenSearch administrative role with access to action groups such as `cluster_manage_index_templates`, `cluster_monitor`, and the index template CRUD permissions listed in [OpenSearch privileges](https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-privileges).
- Initialization needs to be executed only once per installation (and again for minor upgrades requiring schema adjustments).

#### Configure the schema manager settings

Create a custom configuration file for the schema manager with the following values:

```yaml
camunda:
  data:
    secondary-storage:
      type: opensearch
      opensearch:
        # Example assuming an existing privileged user 'camunda-admin'
        username: camunda-admin
        password: camunda123
        url: https://localhost:9200
        # If custom SSL configuration is necessary
        security:
          enabled: true
          self-signed: true
          verify-hostname: false
          certificate-path: PATH_TO_CA_CERT
  # Optional if retention / ISM policies are enabled via schema manager
  database:
    retention:
      enabled: true
# Optional only if legacy OpenSearch exporter (pre Camunda Exporter adoption) is used
zeebe.broker.exporters.opensearch:
  class-name: io.camunda.zeebe.exporter.opensearch.OpensearchExporter
  args:
    url: https://localhost:9200
    index:
      createTemplate: true
    retention:
      enabled: true
    authentication:
      username: camunda-admin
      password: camunda123
```

For additional configuration options, review the [secondary storage configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secondary-storage) and the [OpenSearch exporter configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter).

#### Start the schema manager

Start the `schema` Java application (or `schema.bat` on Windows) from the `bin` directory by using your custom configuration file.

Assuming your configuration is saved as `schema-manager-opensearch.yaml`:

```bash
SPRING_CONFIG_ADDITIONALLOCATION=/path/to/schema-manager-opensearch.yaml ./bin/schema
```

Wait for successful completion (application exits cleanly) before moving to step 2.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges
