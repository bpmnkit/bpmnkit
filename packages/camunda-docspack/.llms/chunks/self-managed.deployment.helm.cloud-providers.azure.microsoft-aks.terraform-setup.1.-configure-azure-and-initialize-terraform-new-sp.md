# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — new-sp

To create a new service principal and assign it the required permissions:

Feel free to change the example name.

```bash
az ad sp create-for-rbac \
  --name "camunda-tf-sp" \
  --role Contributor \
  --scopes /subscriptions/<your-subscription-id>
```

This will return a JSON object with `appId`, `password`, and `tenant`. These values are required for login using the service principal:

```bash
az login --service-principal \
  -u <appId> \
  --tenant <tenant-id>
```

You will be prompted to enter the password interactively.

Replace `<appId>`, `<password>`, and `<tenant-id>` with the actual values of your Service Principal.

Also, ensure that you export the `<appId>` by running the below command after logging in as the SP, as it will be needed [in the next step](#creating-terraformtfvars).

```shell
export AZURE_SP_ID=$(az account show --query user.name -o tsv)
```

#### Creating terraform.tfvars

To configure your deployment, create a `terraform.tfvars` file in the root of the reference architecture folder (`aks-single-region` or `aks-single-region-rdbms`). This file defines critical environment-specific settings like your Azure subscription and the Service Principal used for authentication.

Follow the guide below to get the necessary values:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
