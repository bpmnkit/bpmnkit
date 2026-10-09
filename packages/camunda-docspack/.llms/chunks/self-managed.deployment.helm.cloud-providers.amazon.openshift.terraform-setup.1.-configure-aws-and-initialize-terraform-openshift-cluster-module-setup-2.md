# Deploy a ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — OpenShift cluster module setup (2)

The `--mode auto` flag allows the ROSA CLI to create and link the roles automatically. For environments with stricter IAM policies, use `--mode manual` to review and apply the IAM policies yourself. See the [ROSA STS IAM documentation](https://docs.openshift.com/rosa/rosa_architecture/rosa-sts-about-iam-resources.html) for details.

1. If quotas are insufficient, consult the following:
   - [Provisioned AWS Infrastructure](https://docs.openshift.com/rosa/rosa_planning/rosa-sts-aws-prereqs.html#rosa-aws-policy-provisioned_rosa-sts-aws-prereqs)
   - [Required AWS Service Quotas](https://docs.openshift.com/rosa/rosa_planning/rosa-sts-required-aws-service-quotas.html#rosa-sts-required-aws-service-quotas)

1. Ensure the `oc` CLI is installed. If it's not already installed, follow the [official ROSA oc installation guide](https://docs.openshift.com/rosa/cli_reference/openshift_cli/getting-started-cli.html#cli-getting-started):

   ```bash
   rosa verify openshift-client
   ```

Verify your AWS quotas:

```bash
rosa verify quota --region="$AWS_REGION"
```

**Note**
This may fail due to organizational policies.

#### Set up the ROSA cluster module

1. Ensure you are in the [reference architecture directory of the cloned repository](#obtain-a-copy-of-the-reference-architecture): `./aws/openshift/rosa-hcp-single-region/terraform/`. Then, navigate into the `cluster` module:

   ```bash
   ls
   # Example output:
   # cluster  vpn

   cd cluster
   ```

2. Review the module configuration file `config.tf`.
   This configuration will use the previously created S3 bucket for storing the Terraform state file:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-single-region/terraform/cluster/config.tf
   ```

3. Edit the `cluster.tf` file in the same directory as your `config.tf` file:

**Note: Configure your cluster**

   Customize the cluster name, availability zones, with the values you previously retrieved from the Red Hat Console.
   Additionally, provide a secure username and password for the cluster administrator.

   Ensure that you have set the environment variable `RHCS_TOKEN` with your [OpenShift Cluster Management API Token](https://console.redhat.com/openshift/token/rosa).

**Note: Private cluster**

   By default, this cluster is accessible from the internet.
   If you prefer to restrict access, set `locals.rosa_private_cluster = true`. This will create a [private cluster](https://cloud.redhat.com/experts/rosa/private-link/) that is only accessible through the [private subnets](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html) of your VPC. Optionally, you can still expose a public ingress: [learn more](https://cloud.redhat.com/experts/rosa/private-link/public-ingress/).

   ⚠️ Since private subnets are not reachable from the internet, you'll need to establish a connection between your network and the cluster. This can be done using a [bastion host](https://docs.aws.amazon.com/mwaa/latest/userguide/tutorials-private-network-bastion.html) or a Client VPN.

   See the [VPN module setup](#vpn-module-setup) to configure an [AWS VPN Endpoint](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-getting-started.html) for secure access to the private cluster.

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-single-region/terraform/cluster/cluster.tf
   ```

**Caution: Camunda Terraform module**

   This ROSA module is based on the [official Red Hat Terraform module for ROSA HCP](https://registry.terraform.io/modules/terraform-redhat/rosa-hcp/rhcs/latest). Please be aware of potential differences and choices in implementation between this module and the official one.

   We invite you to consult the [Camunda ROSA module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/rosa-hcp/README.md) for more information.

4. After setting up the terraform files and ensuring your AWS authentication is configured, initialize your Terraform project, then, initialize Terraform to [configure the backend](#create-an-s3-bucket-for-terraform-state-management) and download necessary provider plugins:

   ```bash
   export S3_TF_BUCKET_KEY_CLUSTER="camunda-terraform/cluster.tfstate"

   echo "Storing cluster terraform state in s3://$S3_TF_BUCKET_NAME/$S3_TF_BUCKET_KEY_CLUSTER"

   terraform init -backend-config="bucket=$S3_TF_BUCKET_NAME" -backend-config="key=$S3_TF_BUCKET_KEY_CLUSTER" -backend-config="region=$S3_TF_BUCKET_REGION"
   ```

   Terraform will connect to the S3 bucket to manage the state file, ensuring remote and persistent storage.

5. Configure user access to the cluster. By default, the user who creates the OpenShift cluster has administrative access. If you want to grant access to other users, follow the [Red Hat documentation for granting admin rights to users](https://docs.openshift.com/rosa/cloud_experts_tutorials/cloud-experts-getting-started/cloud-experts-getting-started-admin-rights.html) when the cluster is created.

6. Customize the cluster setup. The module offers various input options that allow you to further customize the cluster configuration. For a comprehensive list of available options and detailed usage instructions, refer to the [ROSA module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/rosa-hcp/README.md).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
