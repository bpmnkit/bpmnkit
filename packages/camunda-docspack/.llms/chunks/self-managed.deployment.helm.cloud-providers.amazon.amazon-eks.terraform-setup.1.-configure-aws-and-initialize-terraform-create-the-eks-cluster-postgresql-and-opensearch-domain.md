# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — Create the EKS cluster, PostgreSQL, and OpenSearch domain

After configuring the `cluster` module (which includes EKS, PostgreSQL, and OpenSearch), use Terraform to plan and create the resources.

**Note: Secret management**

We strongly recommend managing sensitive information such as the OpenSearch, Aurora username and password using a secure secrets management solution like HashiCorp Vault. For details on how to inject secrets directly into Terraform via Vault, see the [Terraform Vault Secrets Injection Guide](https://developer.hashicorp.com/terraform/tutorials/secrets/secrets-vault).

1. Open a terminal in the chosen reference folder where `config.tf` and other `.tf` files are.

   ```bash
      cd ./aws/kubernetes/eks-single-region(-irsa)/terraform/

      ls
      # Example output:
      # cluster  vpn

      cd cluster
   ```

2. Perform a final initialization for anything changed throughout the guide:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/common/procedure/s3-bucket/s3-bucket-tf-init.sh#L7
   ```

3. Plan the configuration files:

   ```bash
   terraform plan -out cluster.plan # describe what will be created
   ```

4. After reviewing the plan, you can confirm and apply the changes.

   ```bash
   terraform apply cluster.plan     # apply the creation
   ```

Terraform will now create the Amazon EKS cluster with all the necessary configurations. The completion of this process may require approximately 20-30 minutes for each component.

#### Define outputs

Terraform lets you define outputs, which make it easier to retrieve important values generated during execution, such as database endpoints and other configuration details needed for the Helm setup.

Each module definition set up in the reference contains an output definition at the end of the file. You can adjust them as needed.

Outputs let you easily reference values such as the **cert-manager** ARN, **external-dns** ARN, and the endpoints for **PostgreSQL** and **OpenSearch** in subsequent steps or scripts, streamlining your deployment process.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
