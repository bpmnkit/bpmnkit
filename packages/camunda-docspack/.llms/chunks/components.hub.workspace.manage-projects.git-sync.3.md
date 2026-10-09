# Sync your Git repository — (3)

<h3> Grant access to the App in the desired Azure projects</h3>

Follow the [documentation on how to add users](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/add-organization-users?view=azure-devops&tabs=browser#add-users-to-your-organization) to add the created application to your Azure organization.

Ensure the following:

- _Access level_ is set to `Basic`.
- Add this to all projects that will be using this integration.
- _Azure DevOps Groups_ is set to `Project Contributors`.

<h3> Configure Azure in Camunda Hub </h3>

**Note**
If you're using a self-hosted Azure DevOps Server instance, see [Self-Managed Git sync](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#git-sync) for configuration details.

1. Within Camunda Hub, navigate to the project you would like to connect to Azure, and select **Connect repository**.

2. Select the **Azure** tile, located at the top of the modal.

3. Provide the following information in the **Configure Azure** modal:
   - **Application (client) ID:** Can be found on the applications registration page.
   - **Directory (tenant) ID:** Your Microsoft Entra tenant unique identifier. Can also be found on the applications registration page.
   - **Private Key:** The private key used to generate the certificate in PEM format.
   - **Certificate:** The certificate used to register the application in PEM format.
   - **Repository URL:** The base URL of the repository you want to sync with, for example `https://dev.azure.com/camunda/my-project/_git/example-repo`. The URL cannot contain the `.git` extension or a folder path. By default, the first repository you create will have the same name as the project and the URL won't explicitly have the project name in it, for example `https://dev.azure.com/camunda/_git/example-repo`.
   - **Branch:** The name of the branch to use for merging and managing changes.
   - **Repository path:** (optional) The path to the folder containing your project files. If left empty, Camunda Hub syncs with the root of the repository. This path is automatically created if it does not exist.

4. Click **Open repository** to test your configuration. The repository for the provided branch and optional path opens in a new tab.

5. Click **Save Configuration**.

When successful, your project will display a new **Sync with Azure** button.

<h3> Generating a private key and certificate</h3>

Follow these steps to generate a private key and self signed certificate that can be used to connect Camunda Hub with your Azure repository:

<h4>1. Generate private key</h4>
Generate a new RSA private key and save it to a file called `private_key.pem`.

```sh
openssl genrsa -out private_key.pem 2048
```

<h4>2. Create a certificate signing request</h4>
Generate a Certificate Signing Request (CSR) using the key created in step 1.

```sh
openssl req -new -key private_key.pem -out cert.csr
```

<h4>3. Create a self-signed certificate</h4>
Using the private key and the certificate signing request, create a certificate.

```sh
openssl x509 -req -days 365 -in cert.csr -signkey private_key.pem -out cert.crt
```

This generates a self-signed certificate named `cert.crt` valid for 365 days.

You can now use it with the private key to register an app in Microsoft Entra, and configure your Azure Git sync configuration.

<h3>Create a new access token</h3>

Camunda Hub requires an access token to sync changes with your Bitbucket Cloud repository. You can use one of the following token types:

- **Repository access token** (recommended)
- Project access token
- Workspace access token

Follow the [Bitbucket documentation](https://support.atlassian.com/bitbucket-cloud/docs/create-a-repository-access-token/) to generate a new repository access token for your repository with the following configuration:

- Enable the following [**scopes**](https://support.atlassian.com/bitbucket-cloud/docs/repository-access-token-permissions/) for your token:
  - `repositories:read`
  - `repositories:write`

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync
