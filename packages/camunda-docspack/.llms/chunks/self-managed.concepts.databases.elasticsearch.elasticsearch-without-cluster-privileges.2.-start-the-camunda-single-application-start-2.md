# Elasticsearch without cluster privileges — 2. Start the Camunda single application {#start} (2)

##### Case 2: Manually-managed app config by the user

If the application configurations are managed directly and do not rely on the Helm chart auto-generated configuration.

```yaml
# Helm chart values file.

orchestration:
  configuration |
    [...] # Any other custom config.
    camunda.database:
      schema-manager:
        create-schema: false
    camunda.data:
      secondary-storage:
        elasticsearch:
          health-check-enabled: false
    zeebe.broker.exporters:
      camundaexporter:
        class-name: io.camunda.zeebe.exporter.CamundaExporter
        args:
          create-schema: false
      elasticsearch:
        class-name: io.camunda.zeebe.exporter.ElasticsearchExporter
        args:
          index:
            create-template: false
          retention:
            enabled: false
            manage-policy: false
    [...] # Any other custom config.
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
