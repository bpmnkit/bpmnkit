# Configure component configuration — Practical example: migrating from environment variables to a configuration file — Step 5: Add the configuration to `values.yaml`

Prefer adding the new settings via `zeebe.extraConfiguration` so you only maintain the keys you changed and keep the chart-provided defaults.

For example:

```yaml
zeebe:
  extraConfiguration:
    - file: backup-s3.yaml
      content: |-
        zeebe:
          broker:
            data:
              backup:
                store: "S3"
                s3:
                  bucketName: "zeebebackuptest"
                  region: "us-east-1"
                  endpoint: "http://loki-minio.monitoring.svc.cluster.local:9000"
                  accessKey: "supersecretaccesskey"
                  secretKey: "supersecretkey"
                  apiCallTimeout: "PT180S"
                  basePath: "zeebebackup"
```

**Caution: Advanced alternative: `zeebe.configuration` overwrites defaults**
If you intentionally want to fully control Zeebe's `application.yml`, place the full configuration under `zeebe.configuration`.

This replaces the chart's default configuration and may require updates during upgrades.

```yaml
zeebe:
  configuration: |-
    zeebe:
      broker:
        data:
          backup:
            store: "S3"
            s3:
              bucketName: "zeebebackuptest"
              region: "us-east-1"
              endpoint: "http://loki-minio.monitoring.svc.cluster.local:9000"
              accessKey: "supersecretaccesskey"
              secretKey: "supersecretkey"
              apiCallTimeout: "PT180S"
              basePath: "zeebebackup"

        exporters:
          elasticsearch:
            className: "io.camunda.zeebe.exporter.ElasticsearchExporter"
            args:
              url: "http://RELEASE-elasticsearch:9200"
              index:
                prefix: "zeebe-record"
                # Example: exporter-side filters for Optimize (Camunda 8.9+)
                # bpmnProcessIdExclusion:
                #   - technicalProcess
                # variableNameInclusionStartWith:
                #   - businessTotal
        gateway:
          enable: true
          network:
            port: 26500
          security:
            enabled: false
            authentication:
              mode: none
        network:
          host: 0.0.0.0
          commandApi:
            port: 26501
          internalApi:
            port: 26502
          monitoringApi:
            port: "9600"
        cluster:
          clusterSize: "1"
          replicationFactor: "1"
          partitionsCount: "1"
          clusterName: RELEASE-zeebe
        threads:
          cpuThreadCount: "3"
          ioThreadCount: "3"
```

The commented `variable-name` and `bpmn-process-id` sections above only illustrate where to configure exporter-side filters for Optimize in Camunda 8.9 and later. For the complete list of available options, their semantics, and upgrade behavior, see:

- [Elasticsearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter)
- [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
