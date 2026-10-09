# Getting started — Storage options

### SaaS

Camunda SaaS manages storage for you by integrating with [**Google Cloud Platform (GCP)**](https://cloud.google.com/storage) and [**AWS S3**](https://aws.amazon.com/s3/) bucket storage.

- Each cluster automatically includes one pre-configured storage bucket. Clusters hosted on GCP use a GCP bucket. Clusters hosted on AWS use an AWS S3 bucket.
- **Maximum upload size per request (whether you're uploading one or multiple files in that request)**: 10 MB
- **File expiration time/time-to-live (TTL) policy**: 30 days. A custom expiration date can be specified via metadata for each document. The [document upload API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api) allows this. You can only set a custom expiration date earlier than the bucket's default TTL; requesting a later date results in it being capped to the bucket's default TTL. For forms, this defaults to the cluster configuration as there is no set custom TTL for forms.

### Self-Managed

If you're deploying Camunda in a Self-Managed environment, document storage must be configured manually. To learn more, visit the [Self-Managed configuration docs](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/index).

**Note**
For storage options in SaaS, you cannot combine AWS and GCP, but you can in Self-Managed (for example, a cluster on GCP and document storage on AWS). This may be the case based on your existing infrastructure. However, having a cluster and document storage by the same provider (GCP or AWS) is more practical. In this case, you may reduce latency, simplify configuration, and avoid potential cross-cloud data transfer costs.

---
Source: https://docs.camunda.io/docs/next/components/document-handling/getting-started
