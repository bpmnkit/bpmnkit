# Encryption at rest using external encryption keys — Step 2: Create and configure an AWS KMS key — Option A: Create the key using AWS CLI

![create key using AWS CLI](./img/create-key-cli.png)

We provide automated scripts to create the necessary AWS KMS key(s) with the correct policy and permissions. Choose the option that matches your backup configuration.

#### Single-region backup

Use this script to create a single AWS KMS key in the same Region as the cluster.

**What the script does:**

- Creates an AWS KMS key with the required policy for Camunda access.
- Sets up an alias for easier key management.
- Outputs the key ARN to provide to Camunda.

**Instructions:**

1. Download [create-byok-kms-key-single-region.sh](https://raw.githubusercontent.com/camunda/camunda-docs/refs/heads/main/docs/components/saas/byok/downloads/create-byok-kms-key-single-region.sh).
2. Modify the following values at the top of the script:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (if using temporary credentials)
   - `YOUR_ACCOUNT_ID`
   - `ALIAS_NAME` (optional)
3. Make the script executable and run it.
4. Copy the outputted key ARN and provide it to Camunda.

#### Dual-region backup

Use this script to create a multi-Region primary key in the cluster’s Region and a replica key in the backup Region.

**What the script does:**

- Creates a multi-Region primary key and replica key.
- Applies the correct policies to both keys.
- Outputs both key ARNs to provide to Camunda.

**Instructions:**

1. Download [create-byok-kms-key-multi-region.sh](https://raw.githubusercontent.com/camunda/camunda-docs/refs/heads/main/docs/components/saas/byok/downloads/create-byok-kms-key-multi-region.sh).
2. Modify the same variables as above.
3. Make the script executable and run it.
4. Copy the two outputted key ARNs and provide them to Camunda.

**Note: Alternative**
For dual-region setups, you can also run the single-region script twice—once in the cluster’s Region and once in the backup Region. Make sure to modify the `REGION` variable before creating the second key.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
