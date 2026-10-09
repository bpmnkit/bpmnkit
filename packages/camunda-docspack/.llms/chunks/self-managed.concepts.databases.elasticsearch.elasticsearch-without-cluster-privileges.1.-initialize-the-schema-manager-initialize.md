# Elasticsearch without cluster privileges — 1. Initialize the schema manager {#initialize}

The schema manager is a separate standalone Java application responsible for creating and managing the database schema, and applying database settings (e.g., retention policies).

**Note**

- Initialization requires a user with cluster-level privileges (e.g., `superuser`) in the database.
- Initialization needs to be executed only once per installation.

#### Configure the schema manager

Create a custom configuration for the schema manager with the following values:

```yaml
camunda:
  data:
    secondary-storage:
      type: elasticsearch
      elasticsearch:
        # Example assuming an existing user called 'camunda-admin' who has 'superuser' privileges
        username: camunda-admin
        password: camunda123
        url: https://localhost:9200
        # If custom SSL configuration is necessary
        security:
          enabled: true
          self-signed: true
          verify-hostname: false
          certificate-path: PATH_TO_CA_CERT
  # Optional, only if ILM is enabled
  database:
    retention:
      enabled: true
# Optional, only if legacy Elasticsearch exporter is used
zeebe.broker.exporters.elasticsearch:
  class-name: io.camunda.zeebe.exporter.ElasticsearchExporter
  args:
    url: https://localhost:9200
    index:
      createTemplate: true
    retention:
      enabled: true
    # Example assuming an existing user called 'camunda-admin' who has 'superuser' privileges
    authentication:
      username: camunda-admin
      password: camunda123
```

For additional configuration options, see the [common secondary storage configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secondary-storage).

#### Start the schema manager

Using the custom configuration file, start the Java application `schema` (or `schema.bat` on Windows) located in the `bin` folder of the delivered JAR package. The schema manager will create the necessary indices and templates in the database and apply the configured settings.

Assuming your custom configuration is saved as `schema-manager.yaml`, you can start the application with the following command:

```shell
SPRING_CONFIG_ADDITIONALLOCATION=/path/to/schema-manager.yaml ./bin/schema
```

Verify that the application executed successfully.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
