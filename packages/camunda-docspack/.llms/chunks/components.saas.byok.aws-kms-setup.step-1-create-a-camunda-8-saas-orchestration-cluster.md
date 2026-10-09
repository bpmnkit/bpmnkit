# Encryption at rest using external encryption keys — Step 1: Create a Camunda 8 SaaS Orchestration cluster

1. Sign in to the [Camunda Hub](https://console.camunda.io/).
1. In the left navigation under **Console**, click **Clusters**.
1. Click **Create cluster**.
1. Select an AWS Region for your cluster.
1. Choose **Single region** or **Dual region backup**.
   - Dual region requires one key per region; keys can be separate.
1. Under **Encryption at rest**, choose **External**.  
   ![external option encryption at rest](./img/external-encryption.png)
1. Click **Create cluster**.

After creation, note the **AWS Role ARN** displayed in Camunda Hub for your cluster. The ARN uses the following format:

```
arn:aws:iam::<account-id>:role/c8-cluster/c8-apps-<uuid>
```

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
