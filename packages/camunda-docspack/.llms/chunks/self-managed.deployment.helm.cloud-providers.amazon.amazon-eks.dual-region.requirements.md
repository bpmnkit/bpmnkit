# Dual-region setup (EKS) — Requirements

- **AWS account** – Required to create AWS resources. See [What is an AWS account?](https://docs.aws.amazon.com/accounts/latest/reference/accounts-welcome.html).
- **AWS CLI** – Command-line tool to manage AWS resources. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
- **Terraform** – IaC tool used to provision resources. [Install Terraform](https://developer.hashicorp.com/terraform/downloads).
- **kubectl** – CLI for interacting with Kubernetes clusters. [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).
- **Helm CLI v4 (recommended; see [supported versions](https://docs.camunda.io/docs/next/reference/supported-environments#clients))** – Package manager for Kubernetes. [Install Helm](https://helm.sh/docs/intro/install/).
- **AWS service quotas** – Verify your quotas before deployment:
  - At least 6 Elastic IPs (three per availability zone, per region).
  - Adequate quotas for **VPCs, EC2 instances, and storage** in both regions.
  - Request increases if needed via the AWS console. You pay only for used resources. See [AWS service quotas](https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html) and [Amazon EC2 service quotas](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html).

For the tool versions used in testing, see the repository's [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file. It contains an up-to-date list of versions used for testing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
