# Sync your Git repository

Connect Camunda Hub to your Git repositories to keep your projects synced.

Organization owners and administrators can connect their Camunda Hub projects to a remote version control repository, allowing users to keep their Camunda Hub and Desktop Modeler projects in sync.

Once the connection is configured by an organization owner or administrator, workspace administrators and editors can use the built-in button to pull changes from the remote repository, integrate contributions from Desktop Modeler users, and merge their own work.


## Connect to a remote repository

Select your Git repository host:

<h3> Create a new GitHub App </h3>

Camunda Hub requires a GitHub App to sync changes with your GitHub repository.

Follow the [GitHub documentation](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app) to create a new GitHub App for your organization or account with the following configuration:

- Under **Webhooks**, deselect **Active**
- Under **Permissions > Repository permissions**, enable **Read and write** for the following options:
  - Commit statuses
  - Contents
  - Pull requests

Click **Create GitHub App** to finish.

<h3> Generate a private key </h3>

1. In your new application's setting page, navigate to **General > Private keys**.
2. Select **Generate a private key**. This key is automatically downloaded as a .pem file when created, and can be opened in a text editor to copy and paste the contents into Camunda Hub.

<h3> Install the GitHub App </h3>

1. In your application's setting page, navigate to **Install app**.
2. Click on the **Install** button for your organization or account.
3. Select **Only select repositories**, and choose the repository to sync with Camunda Hub.
4. Once redirected to your application's installation page, copy the **Installation ID** located at the end of the page's URL: `https://github.com/settings/installations/{installation_id}`.

<h3> Configure GitHub in Camunda Hub </h3>

1. Within Camunda Hub, navigate to the project you would like to connect to GitHub, and click **Connect repository**.
2. Select the **GitHub** tile (if not already selected), located at the top of the modal.

3. Provide the following information in the **Configure GitHub** modal:
   - **Client ID:** Found in your GitHub App's settings page. You can also use Application ID as an alternative. (If you are using GitHub Enterprise Server 3.13 or prior, Application ID is required.)
   - **Installation ID:** Found in the URL of your GitHub App's installation page.
   - **GitHub API Base URL:** The base URL of your [GitHub installation's REST API](https://docs.github.com/en/enterprise-server@3.15/rest/enterprise-admin?apiVersion=2022-11-28#endpoint-urls). This is optional and only required for GitHub Enterprise instances. If left empty, Camunda Hub uses the default GitHub Cloud REST API URL (`https://api.github.com`).

**Note**
     If you're using a self-hosted GitHub instance, see [Self-Managed Git sync](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#git-sync) for configuration details.

     Refer to [GitHub documentation](https://docs.github.com/en/enterprise-server@3.15/rest/enterprise-admin?apiVersion=2022-11-28#endpoint-urls) for more information.

   - **Private Key:** The contents of the .pem file downloaded from your GitHub App's settings page.
   - **Repository URL:** The base URL of the repository you want to sync with, for example `https://github.com/camunda/example-repo`. The URL cannot contain the `.git` extension or a folder path.
   - **Branch name:** The branch name to use for merging and managing changes.
   - **Repository path:** (optional) The path to the folder containing your project files. If left empty, Camunda Hub syncs with the root of the repository. This path is automatically created if it does not exist.

4. Click **Open repository** to test your configuration. The repository for the provided branch and optional path opens in a new tab.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync
