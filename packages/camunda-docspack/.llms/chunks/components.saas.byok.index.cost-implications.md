# Encryption — Cost implications

Using external encryption keys with **AWS KMS** incurs costs directly in your AWS account. Camunda does not charge for the feature itself, but you are responsible for AWS KMS key storage, management, and persistence of logs.

| Cost type       | Description                                             | Notes                                                      |
| --------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| KMS key storage | Monthly charge for each AWS KMS key                     | Depends on AWS Region and key type                         |
| CloudTrail logs | Charges for storing and accessing AWS CloudTrail events | Includes encryption/decryption activity by Camunda cluster |

**Note**
Customers are not charged for key usage operations (for example, encrypting or decrypting) as per [AWS KMS pricing](https://aws.amazon.com/kms/pricing/).

**Warning: Cost responsibility**
You are responsible for monitoring AWS KMS key storage, management, and log persistence costs.

### Cost optimization tips

- Use separate keys only when necessary to avoid extra storage fees.
- Review AWS CloudTrail retention settings to balance compliance and storage cost.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/index
