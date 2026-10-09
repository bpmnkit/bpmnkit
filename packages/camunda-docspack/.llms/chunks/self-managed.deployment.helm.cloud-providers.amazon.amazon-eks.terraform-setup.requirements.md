# Deploy an EKS cluster with Terraform — Requirements

- **AWS account** – Required to create AWS resources. See [What is an AWS account?](https://docs.aws.amazon.com/accounts/latest/reference/accounts-welcome.html).
- **AWS CLI** – Command-line tool to manage AWS resources. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
- **Terraform** – IaC tool used to provision resources. [Install Terraform](https://developer.hashicorp.com/terraform/downloads).
- **kubectl** – CLI for interacting with Kubernetes clusters. [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).
- **jq** – Lightweight JSON processor. [Download jq](https://jqlang.github.io/jq/download/).
- **IAM Roles for Service Accounts (IRSA)** – Configure IRSA to map IAM roles to Kubernetes service accounts. This removes the need for long-lived credentials and lets Kubernetes services assume IAM roles to interact with AWS services (for example, S3, RDS, Route 53).
  - See the AWS [IRSA deep dive](https://aws.amazon.com/blogs/containers/diving-into-iam-roles-for-service-accounts/).
  - IRSA is recommended as an [EKS best practice](https://aws.github.io/aws-eks-best-practices/security/docs/iam/).
- **AWS service quotas** – Verify your quotas before deployment:
  - At least 3 Elastic IPs (one per availability zone).
  - Adequate quotas for **VPCs, EC2 instances, and storage**.
  - Request increases if needed via the AWS console. You pay only for used resources. See [AWS service quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) and [Amazon EC2 service quotas](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html)
- **Shell** – Examples use GNU Bash.

**Note: Secondary storage alternatives**
This guide includes one example path for the Orchestration Cluster's secondary storage. Depending on the guide, that example may use Elasticsearch, OpenSearch, or RDBMS.

If you use a different secondary storage backend, skip the guide-specific storage setup steps and follow [using external OpenSearch in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch) or [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

For the tool versions used in testing, see the repository’s [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file. It contains an up-to-date list of versions used for testing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
