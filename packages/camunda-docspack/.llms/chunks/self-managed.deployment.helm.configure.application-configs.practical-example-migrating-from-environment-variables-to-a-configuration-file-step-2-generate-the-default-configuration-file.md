# Configure component configuration — Practical example: migrating from environment variables to a configuration file — Step 2: Generate the default configuration file

Run the following command to render the default configuration file and fill in Helm values:

```bash
helm template \
    -f values.yaml \
    camunda/camunda-platform \
    --show-only templates/zeebe/configmap.yaml
```

The output includes an `application.yml` section similar to:

```yaml
zeebe:
  broker:
    exporters:
      elasticsearch:
        className: "io.camunda.zeebe.exporter.ElasticsearchExporter"
        args:
          url: "http://RELEASE-elasticsearch:9200"
          index:
            prefix: "zeebe-record"
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

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
