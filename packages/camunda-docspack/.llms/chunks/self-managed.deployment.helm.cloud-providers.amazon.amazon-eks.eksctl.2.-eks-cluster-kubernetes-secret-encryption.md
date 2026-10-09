# Deploy an EKS cluster with eksctl — 2. EKS cluster — Kubernetes secret encryption

The following enables [envelope encryption](https://aws.amazon.com/about-aws/whats-new/2020/03/amazon-eks-adds-envelope-encryption-for-secrets-with-aws-kms/) to add another layer of protection to your Kubernetes secrets.

We recommend enabling KMS encryption as a first step in creating the cluster. Enabling this configuration afterward can take up to 45 minutes. The KMS key is required in the [eksctl cluster YAML](#eksctl-cluster-yaml).

Create AWS KMS Key via the aws-cli. For additional settings, visit the [documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/kms/create-key.html).

```shell
export KMS_ARN=$(aws kms create-key \
  --description "Kubernetes Encryption Key" \
  --query "KeyMetadata.Arn" \
  --output text)
```

The variable `KMS_ARN` contains the required output. It should look something like this: `arn:aws:kms:eu-central-1:1234567890:key/aaaaaaa-bbbb-cccc-dddd-eeeeeeee`.

For more information concerning the KMS encryption, refer to the [eksctl documentation](https://eksctl.io/usage/kms-encryption/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
