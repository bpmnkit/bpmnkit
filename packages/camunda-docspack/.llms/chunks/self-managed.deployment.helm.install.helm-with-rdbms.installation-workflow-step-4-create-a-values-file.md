# RDBMS example deployment for Camunda with Helm — Installation workflow — Step 4: Create a values file

Create a `values-rdbms.yaml` file with your RDBMS configuration:

```yaml
# Configure the Orchestration Cluster to use RDBMS
orchestration:
  enabled: true
  exporters:
    camunda:
      enabled: false
    rdbms:
      enabled: true
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:postgresql://postgres.example.com:5432/camunda
        username: camunda
        secret:
          existingSecret: camunda-db-secret
          existingSecretKey: db-password
  extraConfiguration:
    - file: "flush-interval.yaml"
      content: |
        camunda:
          data:
            secondary-storage:
              rdbms:
                # Optional: Tune for your workload
                flush-interval: PT1S # More frequent flushes
                queue-size: 5000 # Larger queue for buffering
                queue-memory-limit: 50 # Increase if needed
                # Optional: Configure history retention
                history:
                  default-history-ttl: P30D
```

If you deploy Optimize, set its connection under `optimize.database.elasticsearch` or `optimize.database.opensearch`. See [component storage requirements](#important-component-storage-requirements).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
