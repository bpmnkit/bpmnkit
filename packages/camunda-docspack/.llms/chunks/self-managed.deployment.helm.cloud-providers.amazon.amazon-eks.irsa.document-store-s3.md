# IAM Roles for Service Accounts (IRSA) — Document store (S3)

When using the [AWS S3 document store](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm) on Amazon EKS, you can authenticate to S3 with IRSA instead of static AWS credentials. This removes long-lived access keys from your Kubernetes secrets and enables Camunda components to assume an IAM role through their service account.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
