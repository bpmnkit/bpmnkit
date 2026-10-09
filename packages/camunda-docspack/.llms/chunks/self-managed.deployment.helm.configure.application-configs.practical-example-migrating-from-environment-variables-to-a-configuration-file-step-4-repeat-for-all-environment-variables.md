# Configure component configuration — Practical example: migrating from environment variables to a configuration file — Step 4: Repeat for all environment variables

Follow the same process for each environment variable. The resulting configuration looks like this:

```yaml
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
