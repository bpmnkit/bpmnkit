# Deploy a ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — VPN module setup (2)

3. By default, VPN access is allowed from any IP address. You may restrict access by adjusting the `vpn_allowed_cidr_blocks` variable.

4. Network designs vary; please review and adjust the configuration to fit your topology.

5. Customize the VPN module by referring to the [VPN module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/vpn/README.md).

#### Outputs

The module stores certificates and VPN client configurations in the Terraform state. The next section explains how to retrieve and use client configurations.

#### Execution

1. Generate a Terraform plan for the VPN Client Endpoint configuration.
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

Creation of the VPN Client Endpoint typically takes about 10 minutes. After completion, the client configurations will be available in the Terraform output `vpn_client_configs`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
