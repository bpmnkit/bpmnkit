# IAM Roles for Service Accounts (IRSA) — Document store (S3) — Authenticate with EKS Pod Identity instead

To authenticate the document store with [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html) rather than IRSA, keep `global.documentStore.type.aws.irsa.enabled` set to `true`. Despite its name, this flag only stops the chart from injecting the static `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` credentials. Pod Identity requires this too, so the AWS SDK resolves credentials through its default provider chain.

The remaining steps differ from the IRSA setup:

- Skip the OIDC trust policy and the `eks.amazonaws.com/role-arn` service account annotation. Both apply to IRSA only.
- Grant the IAM role to the `orchestration` service account by creating an [EKS Pod Identity association](https://docs.aws.amazon.com/eks/latest/userguide/pod-id-association.html). The role still needs the same S3 permission policy as the IRSA setup, with a trust policy for the `pods.eks.amazonaws.com` service principal.
- When you verify the pods, expect the `AWS_CONTAINER_CREDENTIALS_FULL_URI` environment variable instead of `AWS_ROLE_ARN` and `AWS_WEB_IDENTITY_TOKEN_FILE`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
