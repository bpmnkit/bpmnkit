# Dual-region ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — OpenShift clusters module setup (2)

The `--mode auto` flag allows the ROSA CLI to create and link the roles automatically. For environments with stricter IAM policies, use `--mode manual` to review and apply the IAM policies yourself. See the [ROSA STS IAM documentation](https://docs.openshift.com/rosa/rosa_architecture/rosa-sts-about-iam-resources.html) for details.

1. If quotas are insufficient, consult the following:
   - [Provisioned AWS Infrastructure](https://docs.openshift.com/rosa/rosa_planning/rosa-sts-aws-prereqs.html#rosa-aws-policy-provisioned_rosa-sts-aws-prereqs)
   - [Required AWS Service Quotas](https://docs.openshift.com/rosa/rosa_planning/rosa-sts-required-aws-service-quotas.html#rosa-sts-required-aws-service-quotas)

1. Ensure the `oc` CLI is installed. If it's not already installed, follow the [official ROSA oc installation guide](https://docs.openshift.com/rosa/cli_reference/openshift_cli/getting-started-cli.html#cli-getting-started):

   ```bash
   rosa verify openshift-client
   ```

Configure `CLUSTER_0_REGION` and `CLUSTER_1_REGION` with the target regions respectively.

```bash
# Set the region, adjust as needed
export CLUSTER_0_REGION="us-east-1"
export CLUSTER_1_REGION="us-east-2"
```

Verify your AWS quotas for each region:

```bash
rosa verify quota --region="$CLUSTER_0_REGION"
rosa verify quota --region="$CLUSTER_1_REGION"
```

**Note**
This may fail due to organizational policies.

#### Set up the ROSA clusters module

The dual-cluster setup requires managing two distinct clusters in different regions.
For the simplicity of usage, we will manage the two clusters using a single module, therefore
this guide uses a dedicated [aws terraform provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) for each region.

1. Ensure you are in the [reference architecture directory of the cloned repository](#obtain-a-copy-of-the-reference-architecture): `./aws/openshift/rosa-hcp-dual-region/terraform/`. Then, navigate into the `clusters` module:

   ```bash
   ls
   # Example output:
   # clusters  peering backup_bucket

   cd clusters
   ```

2. Configure your topology deployment, as you will use multiple regions, specify `CLUSTER_0_REGION` and `CLUSTER_1_REGION` with the target regions respectively.

   ```bash
   # set the region, adjust to your needs
   export CLUSTER_0_REGION="us-east-1"
   export CLUSTER_1_REGION="us-east-2"

   # ensure bucket variables are set
   export S3_TF_BUCKET_REGION="<your-region>"
   export S3_TF_BUCKET_NAME="my-rosa-dual-tf-state"
   ```

3. Ensure that your `RHCS_TOKEN` is defined and valid (otherwise, renew it on [OpenShift Cluster Management API Token](https://console.redhat.com/openshift/token/rosa)):

   ```bash
   rosa login --token="$RHCS_TOKEN"
   ```

4. Review the module configuration file `config.tf`.
   This configuration will use the previously created S3 bucket for storing the Terraform state file:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/terraform/clusters/config.tf
   ```

5. Review the file named `cluster_region_0.tf` in the same directory.
   This file describes the cluster of the region 0, you may want to customize the `locals` variables with parameters of your choice, those are described in the next steps.

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/terraform/clusters/cluster_region_0.tf
   ```

6. Do the same review with `cluster_region_1.tf` and adjust it to your needs.
   This file describes the cluster of the region 1:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/terraform/clusters/cluster_region_1.tf
   ```

7. After setting up the terraform files and ensuring your AWS authentication is configured, initialize your Terraform project, then, initialize Terraform to configure the backend and download necessary provider plugins:

   ```bash
   export S3_TF_BUCKET_KEY_CLUSTERS="camunda-terraform/clusters.tfstate"

   echo "Storing clusters terraform state in s3://$S3_TF_BUCKET_NAME/$S3_TF_BUCKET_KEY_CLUSTERS"

   terraform init -backend-config="bucket=$S3_TF_BUCKET_NAME" -backend-config="key=$S3_TF_BUCKET_KEY_CLUSTERS" -backend-config="region=$S3_TF_BUCKET_REGION"
   ```

**For each cluster's file:**

**Note: Configure each cluster**

- Customize the cluster name, availability zones, with the values of your choice.
- Additionally, provide a secure username and password for the cluster administrator.
  We strongly recommend managing sensitive information using a secure secrets management solution like HashiCorp Vault. For details on how to inject secrets directly into Terraform via Vault, see the [Terraform Vault Secrets Injection Guide](https://developer.hashicorp.com/terraform/tutorials/secrets/secrets-vault).

- By default, a cluster is accessible from the internet. If you prefer to restrict access, please refer to the [official documentation of the module](https://registry.terraform.io/modules/terraform-redhat/rosa-hcp/rhcs/latest#input_private).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
