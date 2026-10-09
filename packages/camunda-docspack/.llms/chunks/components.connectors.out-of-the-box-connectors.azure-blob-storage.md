# Azure blob storage connector

Interact with Azure Blob Storage from your BPMN process.

The **Azure Blob Storage connector** is an outbound connector that allows you to interact with
[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) resources from your BPMN processes.

The **Azure Blob Storage connector** currently supports uploading and downloading documents.


## Prerequisites

To begin using the **Azure Blob Storage connector**, ensure you have created the following [resources](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction#blob-storage-resources):

- An Azure [storage account](https://portal.azure.com/#browse/Microsoft.Storage%2FStorageAccounts)
- An Azure [container](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction#containers)


## Authentication

### Create a new connector secret

Keep your secrets secure by avoiding direct inclusion in the BPMN `xml` file. Instead, create a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secrets (for example, `AZURE_SAS_TOKEN`) so you can reference them later in the connector configuration.

### OAuth 2.0

1. In the [Azure Portal](https://portal.azure.com), open **Microsoft Entra ID** and select **+ Add > App registration** to create a new app registration.
   - Note the **client ID** and **tenant ID** from the app registration’s **Overview** tab.
2. Go to **Manage > Certificates & secrets**, select **+ New client secret**, and copy the **Value** (this is your client secret).
3. In **Blob Storage**, open your container, select **Access control (IAM) > Add > Add role assignment**, and assign the app registration one of the following roles:
   - `Storage Blob Data Contributor`
   - `Storage Blob Data Reader`
4. In the connector configuration, enter the following details:
   - **Client ID** – Client ID of the app registration
   - **Tenant ID** – Tenant ID of the app registration
   - **Client Secret** – Client secret value of the app registration
   - **Account URL** – URL of the storage account, for example:  
     `https://<storage_account_name>.blob.core.windows.net/`  
     Replace `<storage_account_name>` with your actual storage account name.

### SAS token

1. In the **Azure Portal**, open your **Storage account > Containers**, and select your container.
2. From the container’s **toolbar**, click **Generate SAS**.
3. In the connector configuration, enter the **SAS token** and **SAS URL**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/azure-blob-storage
