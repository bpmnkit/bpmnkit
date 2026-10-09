# IAM Roles for Service Accounts (IRSA) — IRSA configuration validation of a Camunda 8 helm deployment

The [c8-sm-checks](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/self-managed/operational-guides/troubleshooting#anomaly-detection-scripts) utility is designed to validate IAM Roles for Service Accounts ([IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)) configuration in EKS Kubernetes clusters on AWS. It ensures that key components in a Camunda 8 deployment, such as PostgreSQL and OpenSearch, are properly configured to securely interact with AWS resources via the appropriate IAM roles.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
