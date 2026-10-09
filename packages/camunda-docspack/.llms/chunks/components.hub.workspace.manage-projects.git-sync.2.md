# Sync your Git repository — (2)

5. Click **Save Configuration**.

When successful, your project will display a new **Sync with GitHub** button.

![The Sync with GitHub within Camunda Hub](./img/git-sync.png)

<h3> Create a new access token </h3>

Camunda Hub requires an access token to sync changes with your GitLab repository. You can use one of the following options:

- **Project access token** (recommended)
- Group access token
- Personal access token

To generate a project access token, follow the [GitLab documentation](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#create-a-project-access-token) and use the following configuration:

- Assign the token to a user with the `developer` or `maintainer` role.
- Enable the following [**scopes**](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#scopes-for-a-project-access-token):
  - `api`
  - `read_api`
  - `read_repository`
  - `write_repository`

<h3> Get the project ID </h3>

1. Navigate to your GitLab project.
2. Click the menu icon in the top right corner and select **Copy project ID**.

<h3> Configure GitLab in Camunda Hub </h3>

1. In Camunda Hub, navigate to the project you want to connect to GitLab, and click **Connect repository**.

2. In the modal, select the **GitLab** tile at the top.

3. In the **Configure GitLab** modal, provide the following information:
   - **Access token:** The project, group, or personal access token you generated.
   - **Project ID:** The ID copied from your GitLab project settings.
   - **GitLab API base URL:** The base URL of your [GitLab installation's REST API](https://docs.gitlab.com/api/rest/#make-a-rest-api-request), for example, `https://gitlab.example.com/api/v4`. This is optional and only required for self-hosted GitLab instances. If left empty, Camunda Hub uses the default GitLab Cloud REST API URL (`https://gitlab.com/api/v4`).

**Note**
     If you're using a self-hosted GitLab instance, see [Self-Managed Git sync](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#git-sync) for configuration details.

   - **Repository URL:** The base URL of the repository you want to sync with (e.g., `https://gitlab.com/camunda/example-repo`). The URL must not include the `.git` extension or a folder path.
   - **Branch:** The name of the branch to use for merging and managing changes.
   - **Repository path:** (optional) The folder path that contains your project files. If left empty, Camunda Hub syncs with the root of the repository. The path is created automatically if it doesn't exist.

4. Click **Open repository** to test the configuration. The repository for the selected branch and optional path will open in a new browser tab.

5. Click **Save Configuration**.

Once connected successfully, your project will display a **Sync with GitLab** button.

<h3> Register an App in Microsoft Entra </h3>

**Note**
Camunda Hub SaaS supports authenticating against `Microsoft Entra ID (global service)`. Other [national clouds](https://learn.microsoft.com/en-us/entra/identity-platform/authentication-national-cloud#microsoft-entra-authentication-endpoints) can be used in Self-Managed by setting the environment variable `CAMUNDA_HUB_GITSYNC_AZURE_AUTHORITY_BASE_PATH`.

Camunda Hub requires an application to be registered with Microsoft Entra ID to sync changes with your Azure repository.

1. Follow the [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) documentation to register an application. Be sure to save your `Application (client) ID` and `Directory (tenant) ID`.

2. Configure your application to use [client-certificate credentials](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials?tabs=certificate). You need a PEM-encoded, [PKCS#8](https://en.wikipedia.org/wiki/PKCS_8) private key and a PEM-encoded certificate in `X509` format generated from that key. You will need both later when configuring the connection in Camunda Hub.

3. Configure [scoped permissions](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-access-web-apis) for your app so it can update the content of your Azure repositories. Ensure `Azure DevOps > vso.code_write` is configured, and `Admin consent required` is set to `No`.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync
