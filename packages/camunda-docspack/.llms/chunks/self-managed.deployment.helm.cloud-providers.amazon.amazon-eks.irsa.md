# IAM Roles for Service Accounts (IRSA)

Learn how to configure IAM roles for service accounts (IRSA) within AWS to authenticate workloads.

Camunda 8 components running on Amazon EKS can authenticate to AWS services, such as Amazon S3, Amazon Aurora PostgreSQL, and Amazon OpenSearch Service, without static access keys. Each component assumes an AWS IAM role through its Kubernetes service account. Amazon EKS provides two mechanisms for this, and Camunda supports both:

- [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) maps an IAM role to a service account through an OIDC identity provider. IRSA is the mechanism used throughout this page and in the [Terraform reference architecture](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup).
- [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html) maps an IAM role to a service account through the EKS Pod Identity Agent, without an OIDC provider. It is a simpler alternative to IRSA, and is the default for clusters created with the [eksctl guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl).

Both mechanisms deliver credentials through the [AWS SDK default credentials provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html), so Camunda components need no code or configuration change to switch between them. Camunda validates its deployments and reference architecture with IRSA, and because credential resolution is handled entirely by the AWS SDK, EKS Pod Identity is supported as well.

**Warning: Do not configure IRSA and Pod Identity on the same service account**
Use only one mechanism per Kubernetes service account. If a service account is annotated for IRSA and also has an EKS Pod Identity association, the AWS SDK default credentials provider chain resolves the IRSA web identity token before the Pod Identity credentials. IRSA then takes precedence, and the Pod Identity association is ignored.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
