# Deploy a ROSA HCP Cluster with Terraform — 1. Configure AWS and initialize Terraform — OpenShift cluster module setup (3)

#### Define outputs

**Terraform** allows you to define outputs, which make it easier to retrieve important values generated during execution, such as cluster endpoints and other necessary configurations for Helm setup.

Each module that you have previously set up contains an output definition at the end of the file. You can adjust them to your needs.

#### Execution

**Note: Secret management**

We strongly recommend managing sensitive information (for example, the administrator username and password) using a secure secrets management solution like HashiCorp Vault. For details on how to inject secrets directly into Terraform via Vault, see the [Terraform Vault Secrets Injection Guide](https://developer.hashicorp.com/terraform/tutorials/secrets/secrets-vault).

1. Plan the configuration files:

   ```bash
   terraform plan -out cluster.plan # describe what will be created
   ```

2. After reviewing the plan, you can confirm and apply the changes.

   ```bash
   terraform apply cluster.plan     # creates the resources
   ```

Terraform will now create the OpenShift cluster with all the necessary configurations. The completion of this process may require approximately 20-30 minutes for each component.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
