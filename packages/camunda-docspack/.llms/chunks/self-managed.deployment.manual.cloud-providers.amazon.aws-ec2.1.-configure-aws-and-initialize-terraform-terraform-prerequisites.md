# Amazon EC2 — 1. Configure AWS and initialize Terraform — Terraform prerequisites

To manage Camunda 8 infrastructure on AWS using Terraform, you need to configure Terraform's backend to store the state file remotely in an S3 bucket. This provides secure, persistent primary storage for your infrastructure.

**Note**
Advanced users may choose to configure a different backend. The setup described here is a recommended starting point for new users.

#### Set up AWS authentication

The [AWS Terraform provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) is required to provision resources in AWS. Before using the provider, you must authenticate it with your AWS credentials.

**Caution: Ownership of the created resources**

Any user who creates AWS resources retains administrative access to them. For better control and security, it is recommended to create a dedicated [AWS IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) specifically for Terraform. This ensures the resources are properly managed and owned by a single identity.

You can customize the region and authentication settings as needed. Terraform supports multiple [authentication methods](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration), including:

- For development or testing, you can use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html). If your AWS CLI is already configured, Terraform will automatically detect and use those credentials.

To configure the AWS CLI:

```bash
aws configure
```

Enter your `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, region, and output format. These can be retrieved from the [AWS Console](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).

- For production environments, it is recommended to use a dedicated IAM user. Create [access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for that user via the AWS console, and export them as environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

#### Create an S3 bucket for Terraform state management

Before initializing Terraform, you must create an S3 bucket to store the state file. This is essential for collaborative work and helps prevent issues such as state file corruption.

Begin by setting your preferred AWS region as an environment variable to avoid repeating it in every command:

```bash
export AWS_REGION=<your-region>
```

Replace `<your-region>` with your chosen AWS region (e.g., `eu-central-1`).

Next, follow these steps to create an S3 bucket with versioning enabled:

1. Open your terminal and ensure that the AWS CLI is installed and properly configured.

2. Run the following command to create an S3 bucket for storing your Terraform state. Be sure to choose a unique bucket name, and ensure that the `AWS_REGION` environment variable is already set:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/s3-bucket/s3-bucket-creation.sh
   ```

3. Enable versioning on the S3 bucket to track changes and protect the state file from accidental deletions or overwrites:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/s3-bucket/s3-bucket-versioning.sh
   ```

4. Secure the bucket by blocking public access:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/s3-bucket/s3-bucket-private.sh
   ```

5. Verify versioning is enabled on the bucket:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/s3-bucket/s3-bucket-verify.sh
   ```

The S3 bucket is now ready to securely store your Terraform state files, with versioning enabled for added protection.

#### Initialize Terraform

Once authentication is configured, you can initialize your Terraform project. Earlier, you created a dedicated S3 bucket (`S3_TF_BUCKET_NAME`) for storing the state file. In this step, Terraform will use that bucket along with a specific key to manage your infrastructure state.

Initialize the backend and download the required provider plugins:

**Note**
Make sure you are in the `terraform` subfolder: `camunda-deployment-references/aws/compute/ec2-single-region/terraform`.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/s3-bucket/s3-bucket-tf-init.sh
```

Terraform will now use the S3 bucket to manage the state file, ensuring remote and persistent storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
