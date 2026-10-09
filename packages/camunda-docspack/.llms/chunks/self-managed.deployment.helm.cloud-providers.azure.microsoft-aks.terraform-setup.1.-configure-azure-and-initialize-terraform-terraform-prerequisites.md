# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — Terraform prerequisites

To manage the infrastructure for Camunda 8 on Azure using Terraform, we need to set up Terraform's backend to store the state file remotely in an Azure Storage Account. This ensures secure and persistent storage of the state file.

**Note**
Advanced users may want to handle this part differently and use a different backend. The backend setup provided is an example for new users.

#### Set up Azure authentication

The [Azure Terraform provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs) requires authentication using Azure credentials before it can create resources.

For all environments, create a dedicated Azure AD service principal and assign only the necessary permissions. You can create and assign roles via the [Azure Portal](https://portal.azure.com/) or with the Azure CLI.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
