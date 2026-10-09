# IAM Roles for Service Accounts (IRSA) — Document store (S3) — Create the IAM role and policies

Following the [AWS IRSA documentation](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html), create an IAM role that the Camunda service accounts can assume.

Attach a **permission policy** that grants the required S3 actions on your bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": ["arn:aws:s3:::<your-bucket>", "arn:aws:s3:::<your-bucket>/*"]
    }
  ]
}
```

The role's **trust policy** must allow the relevant Kubernetes service accounts to assume it through web identity. Replace the account ID, region, OIDC provider ID, namespace, and release name with your values:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/oidc.eks.<region>.amazonaws.com/id/<oidc-id>"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.<region>.amazonaws.com/id/<oidc-id>:sub": [
            "system:serviceaccount:<namespace>:<release-name>-orchestration"
          ]
        }
      }
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
