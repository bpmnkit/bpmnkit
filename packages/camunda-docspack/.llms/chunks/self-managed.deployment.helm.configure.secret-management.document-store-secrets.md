# Helm charts secret management — Document Store secrets

Document Store secrets use the structured `secret:` pattern with separate secret configurations for each credential component.

| **Secret**                                 | **Chart values key**                                      | **Purpose**                                                              | **Required when**                                    |
| ------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| **AWS Document Store Access Key ID**       | `global.documentStore.type.aws.accessKeyId.secret`        | AWS access key ID for S3 document storage authentication                 | Using AWS S3 with IAM authentication                 |
| **AWS Document Store Secret Access Key**   | `global.documentStore.type.aws.secretAccessKey.secret`    | AWS secret access key for S3 document storage authentication             | Using AWS S3 with IAM authentication                 |
| **GCP Document Store Service Account**     | `global.documentStore.type.gcp.secret`                    | GCP service account JSON for GCS document storage authentication         | Using GCP Cloud Storage                              |
| **Azure Document Store Connection String** | `global.documentStore.type.azure.connectionString.secret` | Azure Storage connection string for Blob document storage authentication | Using Azure Blob Storage with connection string auth |

**Note**
For Azure Blob Storage with DefaultAzureCredential (managed identities and Workload Identity), the connection string secret is not required.

### Credential precedence with IRSA

The AWS SDK resolves credentials through its [default credential provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html), which reads the static `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables before the IRSA web identity token. Because the chart injects these variables from the access key secrets above whenever the AWS document store is enabled, their presence takes precedence and prevents [IRSA](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa#document-store-s3) from being used, even when the service account is annotated with an IAM role.

To authenticate with IRSA instead, set `global.documentStore.type.aws.irsa.enabled` to `true`. The chart then skips injecting the static credentials, and the AWS access key secrets above are not required.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
