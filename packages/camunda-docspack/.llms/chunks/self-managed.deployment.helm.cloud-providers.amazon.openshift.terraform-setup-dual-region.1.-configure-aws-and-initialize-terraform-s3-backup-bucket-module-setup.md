# Dual-region ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — S3 backup bucket module setup

This section outlines the process of creating a [S3 bucket](https://aws.amazon.com/en/s3/) that will be used to [perform backups of the elasticsearch cluster](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html) used by Camunda 8.
Read more about the [failover procecure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops#procedure).

The S3 bucket is set up following best practices, including encryption, logging, and versioning. These configurations can be customized to suit your specific requirements.

#### Set up the bucket module

In the parent directory where your other modules reside (`clusters` and `peering`), navigate to the directory called `backup_bucket` for the S3 configuration:

```bash
ls
# Example output:
# clusters  peering backup_bucket

cd backup_bucket
```

We'll re-use the previously configured S3 bucket to store the state of the backup bucket configuration.

Begin by reviewing the `config.tf` file to use the S3 backend for managing the Terraform state:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/terraform/backup_bucket/config.tf
```

Finally, review the file called `backup_bucket.tf`, that describes the elastic backup bucket configuration:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/terraform/backup_bucket/backup_bucket.tf
```

This bucket configuration follows [multiple best practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html).  
We encourage you to review the implementation and adjust it according to your specific requirements.

#### Initialize Terraform

Once the `.tf` files are set up, configure the backend for Terraform and set the S3 bucket key for the peering state and initialize Terraform to configure the backend and download the necessary provider plugins:

```bash
# ensure bucket variables are set
export S3_TF_BUCKET_REGION="<your-region>"
export S3_TF_BUCKET_NAME="my-rosa-dual-tf-state"

# set the region of the bucket
export BACKUP_BUCKET_REGION="us-east-1"

export S3_TF_BUCKET_KEY_BUCKET="camunda-terraform/backup-bucket.tfstate"

echo "Storing terraform state in s3://$S3_TF_BUCKET_NAME/$S3_TF_BUCKET_KEY_BUCKET"

terraform init -backend-config="bucket=$S3_TF_BUCKET_NAME" -backend-config="key=$S3_TF_BUCKET_KEY_BUCKET" -backend-config="region=$S3_TF_BUCKET_REGION"
```

This command connects Terraform to the S3 bucket for managing the state file, ensuring remote and persistent storage.
The `BACKUP_BUCKET_REGION` will define the region of the bucket, you can pick one of your cluster region.

#### Execution

1. Navigate to the `backup_bucket` directory where the `config.tf` file and other `.tf` files are located.

1. Run the following command to generate a plan for the S3 bucket configuration. You can edit the default bucket name using `-var=bucket_name=nameOfBucket`

   ```bash
   terraform plan -out backup-bucket.plan \
                  -var backup_bucket_region="$BACKUP_BUCKET_REGION"
   ```

1. After reviewing the execution plan, apply the configuration to create the VPC peering connection:

   ```bash
   terraform apply backup-bucket.plan     # apply the creation
   ```

   This command will initiate the creation of the backup bucket.

1. You will need to store the following secret variables to set up the dual-region installation of Camunda:

   ```bash
   export AWS_ACCESS_KEY_ES=$(terraform output -raw s3_aws_access_key)
   export AWS_SECRET_ACCESS_KEY_ES=$(terraform output -raw s3_aws_secret_access_key)
   export AWS_ES_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
   export AWS_ES_BUCKET_REGION="$BACKUP_BUCKET_REGION"

   echo "AWS_ACCESS_KEY_ES=$AWS_ACCESS_KEY_ES"
   echo "AWS_SECRET_ACCESS_KEY_ES=$AWS_SECRET_ACCESS_KEY_ES"
   echo "AWS_ES_BUCKET_NAME=$AWS_ES_BUCKET_NAME"
   echo "AWS_ES_BUCKET_REGION=$AWS_ES_BUCKET_REGION"
   ```

   Ensure these variables are securely stored, as they will be needed later in the process.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
