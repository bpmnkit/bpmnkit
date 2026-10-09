# Deploy an AKS cluster with Terraform (advanced) — Requirements

- An [Azure subscription](https://azure.microsoft.com/free/) and the necessary permissions to create any resource within Azure.
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli), a CLI tool for creating and managing Azure resources.
- [Terraform](https://developer.hashicorp.com/terraform/downloads) for provisioning infrastructure as code.
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to interact with your AKS cluster.
- [jq](https://stedolan.github.io/jq/download/) to parse and manipulate JSON (e.g. Terraform outputs).
- (optional) Custom domain name/[DNS zone](https://learn.microsoft.com/en-us/azure/dns/dns-zones-records) in Azure DNS. This allows you to expose Camunda 8 endpoints to an external network via the configured ingress.
- **Azure service quotas**
  - Check your quotas for **Virtual Networks**, **vCPU cores**, and **Storage Accounts** in the target region: [Azure subscription and service limits](https://learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits).
  - If you reach a limit, you can [request a quota increase through the Azure portal](https://learn.microsoft.com/en-us/azure/extended-zones/request-quota-increase).
- This guide uses **GNU Bash** for all shell commands.

For the exact tool versions we’ve tested against, see the [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file in the repository.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
