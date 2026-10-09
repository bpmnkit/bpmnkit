# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Migrate document-store cloud credentials (2)

```yaml
connectors:
  env:
    - name: GOOGLE_APPLICATION_CREDENTIALS
      value: /var/secrets/gcp/service-account.json
  extraVolumeMounts:
    - name: connectors-gcp-credentials
      mountPath: /var/secrets/gcp
      readOnly: true
  extraVolumes:
    - name: connectors-gcp-credentials
      secret:
        secretName: gcp-credentials
```

**Camunda Hub REST API:**

```yaml
camundaHub:
  restapi:
    env:
      - name: GOOGLE_APPLICATION_CREDENTIALS
        value: /var/secrets/gcp/service-account.json
    extraVolumeMounts:
      - name: camunda-hub-gcp-credentials
        mountPath: /var/secrets/gcp
        readOnly: true
    extraVolumes:
      - name: camunda-hub-gcp-credentials
        secret:
          secretName: gcp-credentials
```

Workload Identity (GKE) is the equivalent of IRSA. It uses an annotation in `<component>.serviceAccount.annotations`:

```yaml
connectors: # (or camundaHub:)
  serviceAccount:
    annotations:
      iam.gke.io/gcp-service-account: <gsa-name>@<project-id>.iam.gserviceaccount.com
```

#### Azure

Optimize and Camunda Hub need no migration because the chart never connected `global.documentStore.type.azure.*` to them. Chart 14.8.0 and earlier also rendered these settings into Connectors. However, Connectors has no consumer for these settings, so it needs no migration either. Only the document store feature itself reads these settings. The Orchestration Cluster owns this feature.

#### Identity

Chart 14.8.0 and earlier passed the document-store AWS credentials, `AWS_REGION`, and GCP credentials to Management Identity. Chart 14.8.1 and later, and chart 15.x, don't pass them. If you configured Aurora/RDS IAM authentication manually through `identity.env` and used them, keep the datasource override.

Then supply credentials in one of these ways. For static credentials, supply them through `identity.env` or `identity.envFrom`. For IRSA, annotate `identity.serviceAccount`. For EKS Pod Identity, create an association.

The AWS JDBC Wrapper takes the region for the IAM token from the database hostname. Set the `iamRegion` parameter of the wrapper when the hostname doesn't contain the region.

#### Not affected

- **Orchestration Cluster** continues to own `global.documentStore.type.*` for the document store feature itself. AWS, GCP, and in-memory stores need no change if you use these keys only for that feature.

  For Azure Blob Storage, the chart binds `global.documentStore.type.azure.connectionString` to `camunda.document.azure.<activeStoreId>.connection-string`. This binding happens only when you set the connection string Secret and `orchestration.extraConfiguration` declares the store under `camunda.document.azure.<activeStoreId>` (in lowercase). Chart 14.x always set the `DOCUMENT_STORE_<STORE_ID>_CONNECTION_STRING` environment variable instead. See [Azure Blob Storage configuration](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm#azure-blob-storage-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
