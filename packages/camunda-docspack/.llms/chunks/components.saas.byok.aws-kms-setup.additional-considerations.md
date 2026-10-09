# Encryption at rest using external encryption keys — Additional considerations

- **Key rotation**: Enable [automatic rotation](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html) or rotate manually in AWS KMS.
- **Cost**: Using AWS KMS keys incurs storage and management charges in your AWS account. See the [BYOK cost implications](https://docs.camunda.io/docs/next/components/saas/byok/index#cost-implications).
- **Failure scenarios**: Deleting keys or revoking permissions makes cluster data inaccessible. See [troubleshooting steps](https://docs.camunda.io/docs/next/components/saas/byok/faq-and-troubleshooting#troubleshooting-external-encryption-keys).

**Note: Reference**
For more information, see the [AWS KMS documentation](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html).

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
