# Key rotation and audit logging — Audit logging

AWS KMS integrates with AWS CloudTrail to log all key usage. You are responsible for monitoring and persisting these logs.

### What is logged

- Encrypt, Decrypt, GenerateDataKey, and CreateGrant operations
- Failed attempts due to denied access

**Note: Log visibility**
All AWS KMS operations performed by Camunda appear in AWS CloudTrail in your AWS account.

### Audit best practices

1. Enable **AWS CloudTrail** in the cluster Region and persist logs.
2. Set up **Amazon CloudWatch** or **Amazon EventBridge** alerts for key deletion, disabled keys, or access denied events.
3. Review logs regularly for compliance.
4. Use tools like [CloudTrail Lake](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake.html) or [Access Analyzer for KMS](https://docs.aws.amazon.com/kms/latest/developerguide/grants.html) to simplify auditing.
5. Export logs to a centralized SIEM if required.

**Warning: Audit responsibility**
You are responsible for monitoring and persisting AWS KMS activity and logs. Camunda does not have access to AWS CloudTrail logs in your account.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/key-rotation-audit-logging
