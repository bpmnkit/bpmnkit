# Deploy an EKS cluster with eksctl — Prerequisites — Outcome

<!-- TODO : add architecture diagram (https://github.com/camunda/team-infrastructure-experience/issues/409) --->

This guide results in the following:

- An Amazon EKS Kubernetes cluster running the latest Kubernetes version with four nodes ready for Camunda 8 installation.
- Installed and configured [EBS CSI driver](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html), which is used by the Camunda 8 Helm chart to create [persistent volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
- A [managed Aurora PostgreSQL 17.x](https://aws.amazon.com/rds/aurora/) instance that will be used by the Camunda 8 components.
- A [managed OpenSearch domain](https://aws.amazon.com/opensearch-service/) created and configured as a secondary storage option for Camunda (Elasticsearch/OpenSearch variants only; the RDBMS variant uses Amazon Aurora PostgreSQL instead).
- [IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) (IRSA) configured and [Pod Identities](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html).
  - This simplifies the setup by not relying on explicit credentials, but instead allows creating a mapping between IAM roles and Kubernetes service accounts based on a trust relationship. A [blog post](https://aws.amazon.com/blogs/containers/diving-into-iam-roles-for-service-accounts/) by AWS visualizes this on a technical level.
  - This allows a Kubernetes service account to temporarily impersonate an AWS IAM role to interact with AWS services like S3, RDS, or Route53 without supplying explicit credentials.
- [AWS Quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html)
  - Ensure at least **3 Elastic IPs** (one per availability zone).
  - Verify quotas for **VPCs, EC2 instances, and storage**.
  - Request increases if needed via the AWS console ([guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html)). Costs apply only for resources you provision and use.

This basic cluster setup is required to continue with the Helm setup as described in our [AWS Helm guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
