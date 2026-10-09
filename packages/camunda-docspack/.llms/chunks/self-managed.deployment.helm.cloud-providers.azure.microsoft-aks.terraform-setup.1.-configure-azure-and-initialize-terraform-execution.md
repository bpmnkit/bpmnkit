# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — Execution

**Note: Secret management**

We strongly recommend managing sensitive information such as the PostgreSQL username and password using a secure secrets management solution like HashiCorp Vault. For details on how to inject secrets directly into Terraform via Vault, see the [Terraform Vault Secrets Injection Guide](https://developer.hashicorp.com/terraform/tutorials/secrets/secrets-vault).

1. Open a terminal in the chosen reference folder where `config.tf` and other `.tf` files are located.

2. Plan the configuration files:

```bash
terraform plan -out cluster.plan # describe what will be created
```

3. After reviewing the plan, you can confirm and apply the changes:

```bash
terraform apply cluster.plan     # apply the creation
```

Terraform will now create the AKS cluster with all the necessary configurations. The completion of this process may require approximately 20–30 minutes.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
