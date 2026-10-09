# Elasticsearch without cluster privileges — Standalone backup application — 1. Configure the backup application

Create a custom `backup-manager.yaml` configuration file for the standalone backup application using the following values:

```yaml
camunda:
  data:
    backup:
      # Example assuming an existing snapshot repository 'els-test'
      repository-name: els-test
    secondary-storage:
      type: elasticsearch
      elasticsearch:
        # Example assuming an existing user called 'camunda-admin' who has 'snapshot_user' privileges
        username: camunda-admin
        password: camunda123
        url: https://localhost:9200
        # If custom SSL configuration is necessary
        security:
          enabled: true
          self-signed: true
          verify-hostname: false
          certificate-path: PATH_TO_CA_CERT
```

For additional configuration options, see the [common database configuration guide](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#data---secondary-storage).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
