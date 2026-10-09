# Dual-region ROSA HCP Cluster with Terraform — 3. Next installation steps — Deletion of the VPC peering

The VPC peering module can be deleted once it is no longer in use and has no dependencies.
Once the VPC peering is deleted, the clusters will not be able to communicate with each other anymore.

To delete the module, follow these steps:

1. Before proceeding with the deletion of the VPC peering module, ensure that the necessary variables, which were provided during the module creation, are still available. To verify that the required variables are correctly defined, repeat the steps from the [retrieve the VPC peering cluster variables](#retrieve-the-peering-cluster-variables) section.

1. Ensure that the `CLUSTER_0_REGION` and `CLUSTER_1_REGION` variables are defined correctly:

   ```bash
   # set the region, adjust to your needs
   export CLUSTER_0_REGION="us-east-1"
   export CLUSTER_1_REGION="us-east-2"
   ```

1. Navigate to the VPC peering module directory `peering` where the VPC peering module configuration is located.

1. Execute the following command to plan the destruction of the VPC peering module. Ensure the correct variables are passed in, as shown below:

   ```bash
   terraform plan -destroy \
     -var cluster_0_region="$CLUSTER_0_REGION" \
     -var cluster_0_vpc_id="$CLUSTER_0_VPC_ID" \
     -var cluster_1_region="$CLUSTER_1_REGION" \
     -var cluster_1_vpc_id="$CLUSTER_1_VPC_ID" \
     -out destroy-peering.plan
   ```

   This command will generate a plan to destroy the resources and save it in a file called `destroy-peering.plan`.

1. After reviewing the destruction plan, apply the changes to delete the VPC peering module resources by running:

   ```bash
   terraform apply destroy-peering.plan
   ```

   Once the `apply` command completes successfully, the VPC peering module and associated resources will be deleted.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
