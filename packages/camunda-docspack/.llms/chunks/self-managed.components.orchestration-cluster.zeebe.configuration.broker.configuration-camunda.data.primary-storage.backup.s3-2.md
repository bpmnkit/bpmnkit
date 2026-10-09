# Broker configuration — Configuration — camunda.data.primary-storage.backup.s3 (2)

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      backup:
        store: S3
        s3:
          bucket-name: null
          endpoint: null
          region: null
          access-key: null
          secret-key: null
          api-call-timeout: PT180S
          force-path-style-access: false
          compression: none
          base-path: null
          max-concurrent-connections: null
          connection-acquisition-timeout: null
          support-legacy-md5: false
          ssec-key: null
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
