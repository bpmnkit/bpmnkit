# Encryption at rest using external encryption keys — Step 3: Associate the AWS KMS key with your Camunda cluster

1. Return to **Camunda Hub**, and locate the **AWS KMS key ARN** input field.  
   ![KMS AWS key ARN input field](./img/aws-key-arn.png)
   - For dual region, two fields will be available—enter the correct key for each Region.
2. Paste your AWS KMS key ARN(s) from Step 2.
3. Confirm and apply. Camunda provisions storage using your key for:
   - Document handling storage
   - Backup storage
   - Orchestration cluster persistent disks
   - Elasticsearch persistent disks

**Note**
Once a key is applied, it cannot be edited or replaced. To change keys, you must create a new cluster.

---
Source: https://docs.camunda.io/docs/next/components/saas/byok/aws-kms-setup
