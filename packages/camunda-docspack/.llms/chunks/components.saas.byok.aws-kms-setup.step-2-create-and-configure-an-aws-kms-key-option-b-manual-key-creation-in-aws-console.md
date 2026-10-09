# Encryption at rest using external encryption keys — Step 2: Create and configure an AWS KMS key — Option B: Manual key creation in AWS Console

![manual key creation in AWS Console](./img/manual-key-creation.png)

#### Single-region backup

1. **Sign in to the AWS Management Console**
   - Navigate to the AWS KMS service and select the correct Region.
2. **Create a customer managed key**
   - Click **Create key**.
   - Choose **Symmetric** and **Encrypt and decrypt** usage.
3. **Add labels**
   - Add an alias (for example, `camunda-saas-byok`).
   - Add a description (for example, `AWS KMS key for Camunda SaaS BYOK`).
4. **Define key administrators**
   - Select IAM users or roles that will administer the key.
5. **Define key usage permissions**
   - Skip this step; permissions are configured in the next step.
6. **Edit key policy**
   - Switch to policy view and replace the existing policy with the [provided key policy](https://github.com/camunda/camunda-docs/tree/main/docs/components/saas/byok/downloads/aws-kms-key-policy.json).
   - Replace `<YOUR_AWS_ACCOUNT_ID>` and `<TENANT_ROLE_ARN>` with your values.
7. **Finish and copy the ARN**
   - Click **Finish** and copy the key ARN to use in Camunda Hub.

#### Dual-region backup

You can either create a multi-Region key and replica or create two single-Region keys.

##### Method A: Multi-Region key (recommended)

1. Follow the single-region steps, selecting **Multi-Region key** under **Advanced options**.
2. After creating the primary key in the cluster’s Region, go to **Regional replicas** and click **Create replica key**.
3. Select the Region for the replica and confirm. The Region should be the same as the backup Region.
4. Copy both key ARNs and provide them to Camunda.

##### Method B: Two single-Region keys

1. Create a key in the cluster’s Region using the single-region steps.
2. Repeat the process in the backup Region using a different alias (for example, `camunda-saas-byok-replica`).
3. Provide both key ARNs to Camunda.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
