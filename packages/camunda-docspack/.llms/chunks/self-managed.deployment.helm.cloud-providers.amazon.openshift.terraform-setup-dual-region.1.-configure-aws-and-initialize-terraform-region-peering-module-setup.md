# Dual-region ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — Region peering module setup

This section outlines the process of setting up communication between two different AWS regions hosting each cluster. To achieve this, we will make use of the Amazon [Virtual Private Cloud Peering connection](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html).

The VPC peering connection enables two VPCs in different regions to connect and exchange traffic as if they were part of the same network, while maintaining security through the application of appropriate security groups.

Please note that, once the VPC peering is created, it becomes a dependency of the cluster, therefore it must be destroyed before removing the cluster's VPCs.

#### Retrieve the peering cluster variables

To create the peering between each cluster’s VPC, you need to gather some information using the [terraform outputs](https://developer.hashicorp.com/terraform/language/values/outputs) of the [OpenShift clusters module setup](#openshift-clusters-module-setup). Follow these steps:

1. First, go in the clusters module directory

   ```bash
   ls
   # Example output:
   # clusters peering backup_bucket

   cd clusters
   ```

1. Then for each cluster, save the associated [VPC ID](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc):

   ```bash
   export CLUSTER_0_VPC_ID="$(terraform output -raw cluster_0_vpc_id)"
   echo "CLUSTER_0_VPC_ID=$CLUSTER_0_VPC_ID"

   export CLUSTER_1_VPC_ID="$(terraform output -raw cluster_1_vpc_id)"
   echo "CLUSTER_1_VPC_ID=$CLUSTER_1_VPC_ID"
   ```

#### Set up the peering module

In the parent directory where your clusters module reside (`clusters`), navigate to the directory called `peering` which contains the VPC peering configuration:

We'll re-use the previously configured S3 bucket to store the state of the peering configuration.

Begin by reviewing up the `config.tf` that configures S3 backend for managing the Terraform state:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/terraform/peering/config.tf
```

Alongside the `config.tf` file, review the file called `peering.tf` used to reference the peering configuration:

Show peering.tf reference

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/openshift/rosa-hcp-dual-region/terraform/peering/peering.tf
```

One cluster will be referenced as the **owner**, and the other as the **accepter**.
This designation is used solely for networking purposes and does not imply any dependency between the two clusters.

#### Initialize Terraform

Once the `.tf` files are set up, configure the backend for Terraform and set the S3 bucket key for the peering state and initialize Terraform to configure the backend and download the necessary provider plugins:

```bash
# ensure bucket variables are set
export S3_TF_BUCKET_REGION="<your-region>"
export S3_TF_BUCKET_NAME="my-rosa-dual-tf-state"

export S3_TF_BUCKET_KEY_PEERING="camunda-terraform/peering.tfstate"

echo "Storing terraform state in s3://$S3_TF_BUCKET_NAME/$S3_TF_BUCKET_KEY_PEERING"

terraform init -backend-config="bucket=$S3_TF_BUCKET_NAME" -backend-config="key=$S3_TF_BUCKET_KEY_PEERING" -backend-config="region=$S3_TF_BUCKET_REGION"
```

This command connects Terraform to the S3 bucket for managing the state file, ensuring remote and persistent storage.

#### Execution

1. Navigate to the `peering` directory where the `config.tf` file and other `.tf` files are located. Ensure that you have performed [the previously retrieval of the VPC values](#retrieve-the-peering-cluster-variables).

1. Run the following command to generate a plan for the VPC peering configuration.
   It will connect with peering the previously retrieved VPCs of each cluster:

   ```bash
   terraform plan -out peering.plan \
        -var cluster_0_region="$CLUSTER_0_REGION" \
        -var cluster_0_vpc_id="$CLUSTER_0_VPC_ID" \
        -var cluster_1_region="$CLUSTER_1_REGION" \
        -var cluster_1_vpc_id="$CLUSTER_1_VPC_ID"
   ```

1. After reviewing the execution plan, apply the configuration to create the VPC peering connection:

   ```bash
   terraform apply peering.plan
   ```

   This command will initiate the creation of the peering connection, enabling communication between the two clusters.

For more details, consult the official [AWS VPC Peering documentation](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
