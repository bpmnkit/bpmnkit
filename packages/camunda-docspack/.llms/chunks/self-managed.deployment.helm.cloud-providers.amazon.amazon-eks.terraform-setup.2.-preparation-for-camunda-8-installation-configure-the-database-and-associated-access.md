# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — Configure the database and associated access

As you now have a database, you need to create dedicated databases for each Camunda component and an associated user that have a configured access. Follow these steps to create the database users and configure access.

You can access the created database in the following ways:

1. **Bastion host:** Set up a bastion host within the same network to securely access the database.
2. **Pod within the EKS cluster:** Deploy a pod in your EKS cluster equipped with the necessary tools to connect to the database. See [Access internal infrastructure](#access-internal-infrastructure).
3. **VPN:** Establish a VPN connection to the VPC where the Aurora Cluster resides, allowing secure access from your local machine or another network.

The choice depends on your infrastructure setup and security preferences. In this guide, we'll use a pod within the EKS cluster to configure the database.

1. In your terminal, set the necessary environment variables that will be substituted in the setup manifest:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/vars-create-db.sh
   ```

   A **Kubernetes job** will connect to the database and create the necessary users with the required privileges. The script installs the necessary dependencies and runs SQL commands to create the IRSA user and assign it the correct roles and privileges.

2. Create a secret that references the environment variables:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
