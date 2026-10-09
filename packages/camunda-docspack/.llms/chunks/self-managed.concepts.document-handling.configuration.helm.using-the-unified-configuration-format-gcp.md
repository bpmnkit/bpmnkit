# Document handling configuration in Helm — Using the unified configuration format — GCP

```yaml
global:
  documentStore:
    activeStoreId: "gcp1" # must match the store instance ID in extraConfiguration
    type:
      gcp:
        enabled: false # disable legacy env var generation
        existingSecret: "gcp-credentials"
        credentialsKey: "service-account.json"
        mountPath: "/var/secrets/gcp"
        fileName: "service-account.json"

orchestration:
  extraConfiguration:
    - file: gcp-documentstore.yaml
      content: |
        camunda:
          document:
            gcp:
              gcp1: # store instance ID — must match activeStoreId
                bucket-name: my-gcp-bucket
                prefix: documents/ # optional, defaults to temp/ when unset

connectors:
  extraConfiguration:
    - file: gcp-documentstore.yaml
      content: |
        camunda:
          document:
            gcp:
              gcp1: # store instance ID — must match activeStoreId
                bucket-name: my-gcp-bucket
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm
