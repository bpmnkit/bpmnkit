# Encryption at rest using external encryption keys — Step 2: Create and configure an AWS KMS key — Sample key policy

Replace `<tenant-role-arn>` with the **AWS Role ARN** from Step 1, and `<customer-aws-account>` with your AWS account ID.

View sample key policy JSON

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable IAM user permissions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<customer-aws-account>:root"
      },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "Allow Camunda tenant IAM role basic key access",
      "Effect": "Allow",
      "Principal": {
        "AWS": "<tenant-role-arn>"
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:DescribeKey",
        "kms:GenerateDataKey*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Allow Camunda tenant IAM role to create grants for provisioning encrypted EBS volumes",
      "Effect": "Allow",
      "Principal": {
        "AWS": "<tenant-role-arn>"
      },
      "Action": ["kms:CreateGrant", "kms:ListGrants", "kms:RevokeGrant"],
      "Resource": "*"
    }
  ]
}
```

**Warning: Key policy guidance**

- Don’t restrict the Camunda cluster **role** from required AWS KMS actions.
- Key rotation is managed in AWS KMS; Camunda cannot rotate keys.
- Revoking access immediately breaks the cluster.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
