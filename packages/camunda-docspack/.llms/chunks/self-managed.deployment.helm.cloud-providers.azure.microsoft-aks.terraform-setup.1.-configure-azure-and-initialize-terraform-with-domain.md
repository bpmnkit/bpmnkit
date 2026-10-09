# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — with-domain

First, set the following environment variables:

```shell
# The domain name that your Azure DNS zone manages
export TLD=<yourdomain.com>
# The resource group that your Azure DNS zone belongs to
export AZURE_DNS_RESOURCE_GROUP=<your-dns-resource-group>
```

Then, run the following script to create the `terraform.tfvars` file:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/procedure/tfvars-domain.sh
```

##### subscription_id

This value specifies the Azure Subscription ID in which all infrastructure will be deployed, including the AKS cluster, PostgreSQL Flexible Server, and Key Vault. To retrieve your current subscription ID, you can run the following command:

##### terraform_sp_app_id

This is the Application (client) ID of the Azure Service Principal that Terraform uses to configure Role-Based Access Control (RBAC). By providing this ID, Terraform ensures that the Service Principal has the necessary access rights to manage and provision resources within your Azure subscription.

##### dns_zone_id

This value specifies the full Azure resource ID of the DNS Zone used for managing your custom domain.

It is **required** if you are deploying Camunda 8 with a domain name. Terraform uses this value to grant the necessary role-based access control (RBAC) permissions to the `external-dns` Kubernetes add-on, allowing it to create and update DNS records dynamically within your Azure DNS Zone.

If this value is missing or incorrect, `external-dns` will not have permission to manage records, and DNS entries for your Camunda 8 endpoints will not be created.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
