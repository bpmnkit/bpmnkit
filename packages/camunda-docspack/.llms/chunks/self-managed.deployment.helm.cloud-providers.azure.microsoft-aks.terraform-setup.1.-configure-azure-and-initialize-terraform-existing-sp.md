# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — existing-sp

To log in using an existing Azure Service Principal, you need the `appId` and `tenant` values associated with the Service Principal. These credentials allow Terraform to authenticate and provision resources in your Azure subscription.

If you need help finding your tenant ID, refer to [Find your Azure subscription tenant ID](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id).

Use the following command to log in (you will be prompted for the password):

```bash
az login --service-principal \
  -u <appId> \
  --tenant <tenant-id>
```

Replace `<appId>`, `<password>`, and `<tenant-id>` with the actual values of your Service Principal.

Also, ensure that you export the `<appId>` by running the below command after logging in as the SP, as it will be needed [in the next step](#creating-terraformtfvars).

```shell
export AZURE_SP_ID=$(az account show --query user.name -o tsv)
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
