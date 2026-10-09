# Dual-region ROSA HCP Cluster with Terraform — 3. Next installation steps — Deletion of the clusters

The clusters can be deleted once they are no longer in use and have no dependencies. Since clusters rely on the VPC Peering connection, the Peering module must be deleted first.

1. Before proceeding with cluster deletion, ensure that the VPC Peering has been successfully removed by following the steps in the [deletion of the VPC Peering](#deletion-of-the-vpc-peering) section.

1. Go to the directory `clusters` where the clusters configurations are managed.

1. Execute the following command to generate a plan for deleting the clusters, ensuring the correct variables are passed:

   ```bash
   terraform plan -destroy \
     -var cluster_0_region="$CLUSTER_0_REGION" \
     -var cluster_1_region="$CLUSTER_1_REGION" \
     -out destroy-clusters.plan
   ```

   This command will generate a plan to destroy the clusters and save it in a file called `destroy-clusters.plan`.

1. After reviewing the destruction plan, apply the changes to delete the cluster resources by running:

   ```bash
   terraform apply destroy-clusters.plan
   ```

   Once the `apply` command completes successfully, the clusters and associated resources will be deleted.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region
