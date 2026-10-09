# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — Configure OpenSearch fine grained access control

As you now have an OpenSearch domain, you need to configure the related access for each Camunda component.

You can access the created OpenSearch domain in the following ways:

1. **Bastion host:** Set up a bastion host within the same network to securely access the OpenSearch domain.
2. **Pod within the EKS cluster:** Deploy a pod in your EKS cluster equipped with the necessary tools to connect to the OpenSearch domain. See [Access internal infrastructure](#access-internal-infrastructure).
3. **VPN:** Establish a VPN connection to the VPC where the OpenSearch domain resides, allowing secure access from your local machine or another network.

The choice depends on your infrastructure setup and security preferences. In this tutorial, we'll use a pod within the EKS cluster to configure the domain.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
