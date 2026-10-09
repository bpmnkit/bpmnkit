# Dual-region setup (EKS) — 1. Configure AWS and apply Terraform — Create the EKS clusters

**Note: Secret management**

We strongly recommend managing sensitive information using a secure secrets management solution like HashiCorp Vault. For details on how to inject secrets directly into Terraform via Vault, see the [Terraform Vault Secrets Injection Guide](https://developer.hashicorp.com/terraform/tutorials/secrets/secrets-vault).

1. Open a terminal in the reference folder where `config.tf` and other `.tf` files are.

   ```bash
      cd ./aws/kubernetes/eks-dual-region/terraform/clusters/
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

Terraform will now create the Amazon EKS clusters with all the necessary configurations. The completion of this process may require approximately 20-30 minutes for each component.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
