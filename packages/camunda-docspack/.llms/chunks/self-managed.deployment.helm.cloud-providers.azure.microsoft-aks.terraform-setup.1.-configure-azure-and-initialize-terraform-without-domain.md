# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — without-domain

Run the following script to create the `terraform.tfvars` file:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region/procedure/tfvars-no-domain.sh
```

##### subscription_id

This value specifies the Azure Subscription ID in which all infrastructure will be deployed, including the AKS cluster, PostgreSQL Flexible Server, and Key Vault. To retrieve your current subscription ID, you can run the following command:

##### terraform_sp_app_id

This is the Application (client) ID of the Azure Service Principal that Terraform uses to configure Role-Based Access Control (RBAC). By providing this ID, Terraform ensures that the Service Principal has the necessary access rights to manage and provision resources within your Azure subscription.

#### Create an Azure Storage Account for Terraform state management

Before setting up Terraform, you should create an Azure Storage Account and container to store the state file. This is important for collaboration and to prevent issues like state file corruption. This should be in a separate resource group from the main infrastructure.

To start, set the required values as environment variables upfront to avoid repeating them in each command:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/common/procedure/storage-account/storage-account-env-vars.sh
```

Define the value for `AZURE_LOCATION` with your chosen Azure region (for example, `westeurope`).

**Warning**
For production deployments, always use custom names for your Azure Storage Account and related resources. Storage Account names must be **globally unique** across all Azure subscriptions. The provided example (`export AZURE_STORAGE_ACCOUNT_NAME="camundatfstate"`) is for demonstration only and may not be available. Choose a name that is unique and follows your organization's naming conventions to avoid deployment failures.

Now, follow these steps to create the storage account with versioning enabled:

1. Run the following script to create a storage account and container for storing your Terraform state. Make sure that you have chosen a globally unique name for the storage account before:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/azure/common/procedure/storage-account/storage-account-creation.sh
   ```

2. Enable blob versioning to track changes and protect the state file from accidental deletions or overwrites:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/azure/common/procedure/storage-account/storage-account-versioning.sh
   ```

3. Verify versioning is enabled on the blob container:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/azure/common/procedure/storage-account/storage-account-verify.sh
   ```

This Azure Storage Account will now securely store your Terraform state files with versioning enabled.

#### Initialize Terraform

Once your authentication is set up, you can initialize your Terraform project. The [previous steps](#create-an-azure-storage-account-for-terraform-state-management) configured a dedicated Azure Storage Account and container (`AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_CONTAINER_NAME`) to store your state.

Configure the backend and download the necessary provider plugins:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/common/procedure/storage-account/storage-account-tf-init.sh
```

Terraform will connect to the Azure storage container to manage the state file, ensuring remote and persistent storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
