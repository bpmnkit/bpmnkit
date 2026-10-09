# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — VPN module setup (2)

4. Review and adjust the configuration for your network design.

5. For customization options, see the [VPN module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/vpn/README.md).

#### Outputs

The module stores certificates and VPN client configurations in the Terraform state. The next section explains how to retrieve and use client configurations.

#### Execution

1. Generate a Terraform plan for the VPN Client endpoint configuration.
   This will use the private subnets of the designated VPC:

   ```bash
   # describe what will be created
   terraform plan -out vpn.plan \
    -var vpc_id="$CLUSTER_VPC_ID"
   ```

2. Review and apply the plan to create the resources:

   ```bash
   terraform apply vpn.plan     # creates the resources
   ```

Creating the VPN Client endpoint typically takes about 10 minutes. After completion, the Terraform output `vpn_client_configs` provides the client configuration files.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
