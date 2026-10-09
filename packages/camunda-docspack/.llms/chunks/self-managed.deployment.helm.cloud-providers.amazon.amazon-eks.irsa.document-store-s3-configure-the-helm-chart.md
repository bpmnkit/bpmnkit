# IAM Roles for Service Accounts (IRSA) — Document store (S3) — Configure the Helm chart

Set `global.documentStore.type.aws.irsa.enabled` to `true` so the chart does not inject `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` into the pods, and annotate the service account of each component that accesses the document store with the IAM role ARN:

```yaml
global:
  documentStore:
    activeStoreId: "aws"
    type:
      aws:
        enabled: true
        irsa:
          enabled: true
        bucket: "<your-bucket>"
        region: "<your-region>"

orchestration:
  serviceAccount:
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/<iam-role-arn>
```

Annotate the `orchestration` service account shown above.

**Note**
With `irsa.enabled: true`, no AWS credentials secret is required. The AWS SDK resolves credentials through its [default provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html), which picks up the IRSA web identity token.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
