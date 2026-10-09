# Configure component configuration — Practical example: migrating from environment variables to a configuration file — Step 1: Review the existing environment variable configuration

To configure Zeebe backups, earlier charts required environment variables:

```yaml
zeebe:
  clusterSize: "1"
  enabled: true
  partitionCount: "1"
  replicationFactor: "1"
  env:
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_BUCKETNAME
      value: zeebebackuptest
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_REGION
      value: us-east-1
    - name: ZEEBE_BROKER_DATA_BACKUP_STORE
      value: S3
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_ENDPOINT
      value: http://loki-minio.monitoring.svc.cluster.local:9000
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_ACCESSKEY
      value: supersecretaccesskey
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_SECRETKEY
      value: supersecretkey
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_APICALLTIMEOUT
      value: PT180S
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_BASEPATH
      value: zeebebackup
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
