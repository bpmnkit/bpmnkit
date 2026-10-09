# Dual-region ROSA HCP Cluster with Terraform — 3. Next installation steps — Deletion of the S3 backup bucket

The S3 backup bucket can be deleted once it is no longer in use and has no dependencies.
To delete the bucket, follow these steps:

1. Navigate to the `backup_bucket` directory created during the [S3 backup bucket module setup](#s3-backup-bucket-module-setup).
   This directory contains the configuration for managing the S3 bucket.

1. Run the Terraform destroy plan:  
   Execute the following Terraform command to plan the destruction of the S3 bucket and other resources:

   ```bash
   terraform plan -destroy -out destroy-bucket.plan
   ```

   This command will generate a plan to destroy the resources and output it into a file called `destroy-bucket.plan`.

1. After reviewing the plan, apply the changes to delete the resources with the following command:

   ```bash
   terraform apply destroy-bucket.plan
   ```

   Once the `apply` command is successfully completed, the S3 bucket and associated resources will be deleted.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
