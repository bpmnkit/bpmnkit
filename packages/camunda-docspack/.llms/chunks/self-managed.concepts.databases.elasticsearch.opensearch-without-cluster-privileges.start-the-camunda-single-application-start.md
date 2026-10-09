# OpenSearch without cluster privileges — Start the Camunda single application {#start}

Start the application with a less privileged OpenSearch user. Most operations require only index-level privileges (`manage` for required indices), but `indices:data/read/scroll/clear` must be assigned as a cluster permission. OpenSearch treats the permission to clear scrolls as a cluster-wide action because scroll IDs are not bound to a specific index endpoint in the request URL.

#### OpenSearch user with required privileges

Create or reuse a user with at least the following index privileges on all Camunda indices:

- `manage` (covers create index, mappings updates, search, read, write)

You can create a role using OpenSearch Security plugin APIs (for IAM roles on AWS OpenSearch Service, please refer to [Identity and Access Management in Amazon OpenSearch Service](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/ac.html)). Example role definition:

```bash
curl -XPUT https://localhost:9200/_plugins/_security/api/roles/camunda_app_role \
  -H 'Content-Type: application/json' \
  -u admin:admin \
  -d '{
    "cluster_permissions": [
      "indices:data/read/scroll/clear"
    ],
    "index_permissions": [
      {
        "index_patterns": [
          "zeebe-*",
          "operate-*",
          "tasklist-*",
          "camunda-*"
        ],
        "allowed_actions": [
          "indices:data/write/*",
          "indices:data/read/*",
          "indices:admin/create",
          "indices:admin/shards/search_shards"
        ]
      }
    ]
  }'
```

Then assign the role to the user (example using Security plugin user API):

```bash
curl -XPUT https://localhost:9200/_plugins/_security/api/internalusers/camunda-app \
  -H 'Content-Type: application/json' \
  -u admin:admin \
  -d '{"password": "camunda123", "opendistro_security_roles": ["camunda_app_role"]}'
```

#### Configure the Camunda single application

Disable schema creation in the application configuration so it reuses what the standalone schema manager prepared:

```yaml
camunda:
  data:
    secondary-storage:
      type: opensearch
      opensearch:
        # Example restricted user 'camunda-app'
        username: camunda-app
        password: camunda123
        url: https://localhost:9200
        security:
          enabled: true
          self-signed: true
          verify-hostname: false
          certificate-path: PATH_TO_CA_CERT
  database:
    schema-manager:
      createSchema: false
  tasklist:
    opensearch:
      health-check-enabled: false
    # Only required for upgrades from 8.7 (legacy component configs)
    zeebe-elasticsearch: # legacy key retained for backward compatibility
      username: camunda-app
      password: camunda123
      url: https://localhost:9200
      ssl:
        self-signed: true
        verify-hostname: false
        certificate-path: PATH_TO_CA_CERT
  operate:
    opensearch:
      health-check-enabled: false
    # Only required for upgrades from 8.7 (legacy component configs)
    zeebe-elasticsearch: # legacy key retained for backward compatibility
      username: camunda-app
      password: camunda123
      url: https://localhost:9200
      ssl:
        self-signed: true
        verify-hostname: false
        certificate-path: PATH_TO_CA_CERT
zeebe.broker.exporters:
  camundaexporter:
    class-name: io.camunda.zeebe.exporter.CamundaExporter
    args:
      createSchema: false
      history:
        retention:
          enabled: true # Only if ISM retention enabled globally
  opensearch:
    class-name: io.camunda.zeebe.exporter.opensearch.OpensearchExporter
    args:
      url: https://localhost:9200
      index:
        createTemplate: false
      retention:
        enabled: false
        managePolicy: false
      authentication:
        username: camunda-app
        password: camunda123
```

#### Start from the JAR distribution

```bash
SPRING_CONFIG_ADDITIONALLOCATION=/path/to/application-opensearch.yaml ./bin/camunda
```

#### Start using Helm charts

If using Helm, disable schema creation via environment variables:

```yaml
# values.yaml snippet
orchestration:
  env:
    - name: CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA
      value: "false"
    - name: CAMUNDA_DATA_SECONDARYSTORAGE_OPENSEARCH_HEALTHCHECKENABLED
      value: "false"
    - name: ZEEBE_BROKER_EXPORTERS_CAMUNDAEXPORTER_ARGS_CREATESCHEMA
      value: "false"
    - name: ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_INDEX_CREATETEMPLATE
      value: "false"
    - name: ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_RETENTION_ENABLED
      value: "false"
```

Or when managing configuration manually:

```yaml
# values.yaml snippet (manual configuration block)
orchestration:
  configuration: |
    camunda.database:
      schema-manager:
        create-schema: false
    camunda.data.secondary-storage.opensearch:
      health-check-enabled: false
    zeebe.broker.exporters:
      camundaexporter:
        class-name: io.camunda.zeebe.exporter.CamundaExporter
        args:
          create-schema: false
      opensearch:
        class-name: io.camunda.zeebe.exporter.opensearch.OpensearchExporter
        args:
          index:
            create-template: false
          retention:
            enabled: false
            manage-policy: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges
