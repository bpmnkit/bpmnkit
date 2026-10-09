# Elasticsearch without cluster privileges — 2. Start the Camunda single application {#start}

The Camunda single application can now be started without cluster-level privileges. It will connect to the database and use the schema previously created by the schema manager.

#### Elasticsearch user with sufficient privileges

Ensure that an Elasticsearch user with sufficient privileges exists. The application requires a database user with at least `manage` privileges on the indices it needs to access.

You can either use an existing user with the required privileges or assign the necessary privileges to an example user named `camunda-app` by sending the following request to the Elasticsearch REST API:

```yaml
PUT _security/role/read_write_role
{
  "indices": [
    {
      "names": [
        "*"
      ],
      "privileges": [
        "read",
        "write",
        "view_index_metadata"
      ],
      "allow_restricted_indices": false
    },
    {
      "names": [
        "camunda-*",
        "operate-*",
        "tasklist-*",
        "zeebe-*"
      ],
      "privileges": [
        "manage"
      ],
      "allow_restricted_indices": false
    }
  ],
  "applications": [],
  "run_as": [],
  "metadata": {},
  "transient_metadata": {
    "enabled": true
  }
}
```

Next, assign the user to the role defined above. For example, if Elasticsearch is running on Docker, use the following command:

```shell
docker exec -t elasticsearch elasticsearch-users useradd camunda-app -p camunda123
docker exec -t elasticsearch elasticsearch-users roles camunda-app -a read_write_role
```

#### Configure the Camunda single application

Create a configuration for the Camunda single application with the following values. This essentially disables schema creation for the application.

```yaml
camunda:
  data:
    secondary-storage:
    type: elasticsearch
    elasticsearch:
      # Example assuming an existing user called 'camunda-app' with the privileges described in 2.1
      username: camunda-app
      password: camunda123
      url: https://localhost:9200
      # If custom SSL configuration is necessary
      security:
        enabled: true
        self-signed: true
        verify-hostname: false
        certificate-path: PATH_TO_CA_CERT
  database:
    schema-manager:
      createSchema: false
  # only required for upgrades from 8.7
  tasklist:
    zeebe-elasticsearch:
      username: camunda-app
      password: camunda123
      url: https://localhost:9200
      # If custom SSL configuration is necessary
      ssl:
        self-signed: true
        verify-hostname: false
        certificate-path: PATH_TO_CA_CERT
  # only required for upgrades from 8.7
  operate:
    zeebe-elasticsearch:
      # Example assuming an existing user called 'camunda-app' with the privileges described in 2.1
      username: camunda-app
      password: camunda123
      url: https://localhost:9200
      # If custom SSL configuration is necessary
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
        # Optional, only if ILM is enabled
        retention:
          enabled: true
  # Optional, only if legacy Elasticsearch exporter is used
  elasticsearch:
    class-name: io.camunda.zeebe.exporter.ElasticsearchExporter
    args:
      url: https://localhost:9200
      index:
        create-template: false
      retention:
        enabled: false
        manage-policy: false
      # Example assuming an existing user called 'camunda-app' with the privileges described in 2.1
      authentication:
        username: camunda-app
        password: camunda123
```

#### Start the application

You can start the application using the custom configuration either from the JAR file or with Helm charts.

#### Start the application from the JAR file

Start the Java application `camunda` (or `camunda.bat` on Windows), located in the `bin` folder of the delivered JAR package.

Assuming the configuration is saved in a file named `application-custom.yaml`, start the application with the following command:

```
SPRING_CONFIG_ADDITIONALLOCATION=/path/to/application-custom.yaml ./bin/camunda
```

#### Starting the application using Helm charts

##### Case 1: Auto-generated app configuration by Helm chart

[Spring Boot convention](https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables) environment variables can be used to override configuration.

The following Helm values are needed to disable the schema manager in the Camunda apps.

```yaml
# Helm chart values file.
orchestration:
  env:
    - name: CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA
      value: "false"
    - name: CAMUNDA_DATA_SECONDARYSTORAGE_ELASTICSEARCH_HEALTHCHECKENABLED
      value: "false"
    - name: ZEEBE_BROKER_EXPORTERS_CAMUNDAEXPORTER_ARGS_CREATESCHEMA
      value: "false"
    - name: ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_INDEX_CREATETEMPLATE
      value: "false"
    - name: ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_RETENTION_ENABLED
      value: "false"
    - name: ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_RETENTION_MANAGEPOLICY
      value: "false"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
