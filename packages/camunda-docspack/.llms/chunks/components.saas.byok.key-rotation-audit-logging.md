# Key rotation and audit logging

Camunda cannot rotate customer-managed keys. Any key rotation must be performed manually within your AWS account.

Learn more about key rotation and audit logging when using AWS BYOK with Camunda 8 SaaS.

**Note: Disclaimer**
References to Amazon Web Services (AWS) operations may change over time. Camunda does not control AWS features, APIs, or logs. This documentation may become outdated if AWS updates their services.


## Key rotation

With BYOK, you manage your own encryption keys in AWS KMS. Camunda cannot rotate customer-managed keys. Only you can rotate keys in AWS KMS.

### Manual key rotation

- Rotating a key in AWS KMS does not change the Key ID.
- New key material is generated for future encryption; previously encrypted data remains accessible.
- Camunda clusters continue using the same Key ID and do not need reconfiguration.
- Camunda does not re-encrypt existing data; you are responsible for key management.

To use a new AWS KMS key instead of rotating, contact [Camunda support](https://camunda.com/services/support-guide/) to update cluster settings.

**Warning: Key rotation caution**

- Do not delete or disable an old key until the cluster uses a replacement. For details on how Camunda responds when an external KMS key becomes disabled, deleted, or misconfigured, see [key state behavior](https://docs.camunda.io/docs/next/components/saas/byok/key-state-behavior).
- Improper key management may block data access.
- Ensure backup storage and persistent volumes remain accessible.
- See [KMS key rotation](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html) and [S3 server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html).

### Best practices

| Practice                      | Description                                                               |
| ----------------------------- | ------------------------------------------------------------------------- |
| Separate keys per environment | Use different keys for production, staging, and development clusters.     |
| Regular auditing              | Periodically review AWS KMS key policies and access logs.                 |
| Monitor rotation              | Use Amazon CloudWatch or Amazon EventBridge to track key rotation events. |

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-rotation-audit-logging
