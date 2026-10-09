# Encryption at rest using external encryption keys — Step 4: Verify encryption and logging

- In **Camunda Hub**, check the cluster details **Encryption at rest** tab to confirm the **AWS KMS key ARN** is applied correctly.
- In AWS, verify key usage:
  1. Navigate to **Customer managed keys**.
  2. Select your key and view **Key policy** and **Key usage** tabs.
  3. Review **Recent activity** to confirm operations (Encrypt, Decrypt, GenerateDataKey).

### Monitor AWS KMS usage

- **AWS CloudTrail** logs all AWS KMS operations.
- **Amazon CloudWatch** can trigger alarms for:
  - Key deletion or disabling
  - Unauthorized access attempts
  - Policy or grant modifications
- Regularly review logs to detect unauthorized activity.
- Optionally, integrate with **Amazon EventBridge** for event-based monitoring and automation.

**Warning: Monitoring reminder**
You are responsible for monitoring key usage and access logs within your AWS account. Use AWS CloudTrail, Amazon CloudWatch, and Amazon EventBridge to detect misconfigurations or unauthorized access.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
