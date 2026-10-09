# Configure component configuration — Practical example: migrating from environment variables to a configuration file — Step 3: Map environment variables to configuration properties

For each environment variable, find the corresponding property in the [Zeebe configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker).

For example, the environment variable `ZEEBE_BROKER_DATA_BACKUP_S3_BUCKETNAME` maps to the property `zeebe.broker.data.backup.s3.bucketName`, documented under [Zeebe S3 Backup](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdatabackups3).

Add the property to the configuration file. Add the `data` section under `zeebe.broker`:

```yaml
zeebe:
  broker:
    data:
      backup:
        s3:
          bucketName: "zeebebackuptest"
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
