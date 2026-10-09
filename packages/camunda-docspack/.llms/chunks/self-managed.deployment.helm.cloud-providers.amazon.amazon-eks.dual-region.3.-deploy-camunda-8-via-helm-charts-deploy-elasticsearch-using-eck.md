# Dual-region setup (EKS) — 3. Deploy Camunda 8 via Helm charts — Deploy Elasticsearch using ECK

Elasticsearch is managed using the [Elastic Cloud on Kubernetes (ECK)](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html) operator instead of the Camunda Helm chart's built-in Elasticsearch subchart. This provides automated lifecycle management and built-in security with auto-generated credentials.

For more details on ECK-based deployments, see [Elasticsearch deployment in the operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment).

#### Create the S3 backup secret for Elasticsearch

Elasticsearch requires an S3 bucket for data backup and restore procedures during regional failback. The ECK operator injects these credentials into the Elasticsearch keystore at startup.

You can pull the data from Terraform since you exposed those via `output.tf`.

1. From the Terraform code location `aws/kubernetes/eks-dual-region/terraform/clusters`, execute the following to export the access keys to environment variables:

```bash
export AWS_ACCESS_KEY_ES=$(terraform output -raw s3_aws_access_key)
export AWS_SECRET_ACCESS_KEY_ES=$(terraform output -raw s3_aws_secret_access_key)
```

2. From the folder `aws/kubernetes/eks-dual-region/procedure` of the repository, execute the script [create_elasticsearch_secrets.sh](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/procedure/create_elasticsearch_secrets.sh). This creates the ECK-compatible `elasticsearch-env-secret` in both regions with the S3 credentials. Those have previously been defined and exported via the [environment variables](#export-environment-variables).

```bash
./create_elasticsearch_secrets.sh
```

3. Unset environment variables to reduce the risk of potential exposure:

```bash
unset AWS_ACCESS_KEY_ES
unset AWS_SECRET_ACCESS_KEY_ES
```

**Caution: Bucket vulnerable to region outages**

The Elasticsearch backup [bucket is tied to a specific region](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html). If that region becomes unavailable and you want to restore to a different region or S3 services remain disrupted, you must create a new bucket in another region and reconfigure your Elasticsearch cluster to use the new bucket.

#### Deploy the ECK operator and elasticsearch clusters

Before deploying the Elasticsearch cluster, install the ECK operator and its Custom Resource Definitions (CRDs) in both clusters. The ECK operator manages the lifecycle of Elasticsearch resources in Kubernetes.

Run [deploy.sh](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/deploy.sh) from `generic/kubernetes/operator-based/elasticsearch/`:

```bash
cd generic/kubernetes/operator-based/elasticsearch
export ELASTICSEARCH_CLUSTER_FILE="elasticsearch-cluster-dual-region.yml"
KUBE_CONTEXT=$CLUSTER_0 ./deploy.sh
KUBE_CONTEXT=$CLUSTER_1 ./deploy.sh
cd -
```

This performs the following actions:

- Installs the ECK CRDs.
- Deploys the operator to the `elastic-system` namespace.
- Waits for operator readiness.
- Creates the Elasticsearch cluster in both regions using the ECK operator.

Review the Elasticsearch deploy.sh script

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/deploy.sh
```

The dual-region Elasticsearch cluster manifest is located at `generic/kubernetes/operator-based/elasticsearch/elasticsearch-cluster-dual-region.yml`.

Review the Elasticsearch cluster configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/elasticsearch-cluster-dual-region.yml
```

For more details on the ECK operator deployment, see the [operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment).

#### Synchronize Elasticsearch passwords across regions

Each ECK-managed Elasticsearch cluster auto-generates its own `elasticsearch-es-elastic-user` secret with a unique password. For Zeebe exporters to authenticate against the remote region's Elasticsearch, each region needs access to the other region's password.

Run [sync_elasticsearch_passwords.sh](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/procedure/sync_elasticsearch_passwords.sh) from `aws/kubernetes/eks-dual-region/procedure` to create cross-region password secrets:

```bash
cd aws/kubernetes/eks-dual-region/procedure
./sync_elasticsearch_passwords.sh
cd -
```

This script reads the ECK-generated passwords and creates region-specific secrets in both regions:

- `elasticsearch-es-password-region-0`: password from region 0's Elasticsearch
- `elasticsearch-es-password-region-1`: password from region 1's Elasticsearch

These secrets are referenced by the Zeebe exporter configuration in `camunda-values.yml` to authenticate against Elasticsearch in each region.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
