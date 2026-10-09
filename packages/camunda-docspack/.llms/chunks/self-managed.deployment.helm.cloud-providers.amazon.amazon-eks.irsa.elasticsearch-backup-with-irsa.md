# IAM Roles for Service Accounts (IRSA) — Elasticsearch backup with IRSA

When implementing [backup and restore procedures](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) for Elasticsearch in your Camunda deployment, you can use IRSA to securely access S3 buckets.

### Elasticsearch backup configuration

**Note**
The bundled Bitnami Elasticsearch subchart is removed in Camunda 8.10, so the snapshot configuration that targeted that subchart no longer applies. For those steps, see the [8.9 documentation](https://docs.camunda.io/docs/8.9/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa/).

In Camunda 8.10, deploy Elasticsearch with the [ECK operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment) or use a managed service. IRSA covers the ECK deployment only, because a managed service runs outside your cluster and exposes no Kubernetes service account.

For an ECK deployment, create an IAM role mapped to the Elasticsearch service account with the required S3 permissions, following the [AWS IRSA documentation](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html) and the [Elasticsearch S3 repository documentation](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/s3-repository#repository-s3-permissions).

Then configure the ECK deployment to recognize the IRSA token and register the S3 snapshot repository, as described in the [Elasticsearch documentation](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/s3-repository#iam-kubernetes-service-accounts). The `<account-id>` and IAM role ARN come from the [AWS IRSA documentation](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

For a managed service, grant snapshot access through the provider's own IAM configuration instead. Amazon OpenSearch Service registers the repository with a dedicated IAM role, as described in [Creating index snapshots in Amazon OpenSearch Service](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/managedomains-snapshots.html).

**Info**
`$AWS_WEB_IDENTITY_TOKEN_FILE` is automatically injected into the pod by EKS when the pod is using a service account annotated with a valid `eks.amazonaws.com/role-arn`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
