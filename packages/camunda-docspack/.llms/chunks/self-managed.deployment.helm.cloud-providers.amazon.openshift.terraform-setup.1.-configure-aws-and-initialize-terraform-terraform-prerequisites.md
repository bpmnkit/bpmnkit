# Deploy a ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — Terraform prerequisites

To manage the infrastructure for Camunda 8 on AWS using Terraform, we need to set up Terraform's backend to store the state file remotely in an S3 bucket. This ensures secure and persistent storage of the state file.

**Note**
Advanced users may want to handle this part differently and use a different backend. The backend setup provided is an example for new users.

#### Set up AWS authentication

The [AWS Terraform provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) is required to create resources in AWS. Before you can use the provider, you must authenticate it using your AWS credentials.

**Warning: Ownership of created resources**

A user who creates resources in AWS will always retain administrative access to those resources, including any Kubernetes clusters created. Camunda recommends you create a dedicated [AWS IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) for Terraform purposes, ensuring the resources are managed and owned by that user.

The AWS Terraform provider supports [multiple authentication methods](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration). If you have configured the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html), Terraform will automatically detect and use those credentials:

```bash
aws configure
```

For production environments, avoid long-lived access keys. Prefer short-lived credentials such as [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html), [IAM Identity Center (SSO)](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html), or [environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) sourced from a secrets manager. See the [provider documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration) for the full list of supported methods.

#### Create an S3 bucket for Terraform state management

Before setting up Terraform, you need to create an S3 bucket to store the state file. This is important for collaboration and preventing issues like state file corruption.

To start, set the region as an environment variable to avoid repeating it in each command:

```bash
export AWS_REGION=<your-region>
```

Replace `<your-region>` with your chosen AWS region (for example, `eu-central-1`).

**Note: Region configuration**

- Regions outside of `us-east-1` require the appropriate `LocationConstraint` to be specified in order to create the bucket in the desired region. Region `us-east-1` can only be created without specifying it.
- This region can be different from the regions used for other resources, but it must be set explicitly in the backend configuration using the flag: `-backend-config="region=<your-region>"`. For clarity, this guide explicitly sets the bucket region in all relevant commands.

Now, follow these steps to create the S3 bucket with versioning enabled:

1. Open your terminal, and ensure the AWS CLI is installed and configured.

2. Run the following command to create an S3 bucket for storing your Terraform state. Make sure to use a unique bucket name, and set the `AWS_REGION` environment variable beforehand:

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

This S3 bucket will now securely store your Terraform state files with versioning enabled.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
