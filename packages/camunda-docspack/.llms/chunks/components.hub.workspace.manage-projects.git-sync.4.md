# Sync your Git repository — (4)

<h3>Configure Bitbucket Cloud in Camunda Hub</h3>

1. In Camunda Hub, navigate to the project you want to connect to Bitbucket Cloud, and click **Connect repository**.

2. Select the **Bitbucket** tile at the top of the modal.

3. Fill in the **Configure Bitbucket** modal with the following information:
   - **Access token:** The repository, project, or workspace access token you generated.
   - **Bitbucket API Base URL:** Leave empty. Only required for [Bitbucket Data Center](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync/git-sync.md?platform=bitbucket-data-center) instances.
   - **Repository URL:** The base URL of the repository you want to sync with, e.g., `https://bitbucket.org/camunda/example-repo`. The URL must not include the `.git` extension or any folder path.
   - **Branch name:** The branch to use for merging and managing changes.
   - **Repository path:** (optional) The folder path containing your project files. If left empty, Camunda Hub syncs with the repository root. This path will be created automatically if it does not exist.

4. Click **Open repository** to test your configuration. The repository for the specified branch and optional path will open in a new tab.

5. Click **Save Configuration**.

Once successful, your project will display a new **Sync with Bitbucket** button.

**Info: Atlassian Data Center End of Life**

Bitbucket Data Center reaches its end of life on March 28, 2029. See [Atlassian's announcement](https://www.atlassian.com/licensing/data-center-end-of-life).
Consider migrating to Bitbucket Cloud or another supported Git provider for continued support and updates.

**Warning: Limitations**

Due to [limitations in the Bitbucket Data Center API](https://jira.atlassian.com/browse/BSERV-14381), Camunda Hub cannot push file deletions to Bitbucket Data Center repositories.
If you delete, move, or rename files in Camunda Hub, the original will remain in the remote repository after synchronization.

<h3>Create a new access token</h3>

Camunda Hub requires a **user** HTTP access token to sync changes with your Bitbucket Data Center repository.
Repository or project access tokens are not supported.

Follow the [Bitbucket documentation](https://confluence.atlassian.com/bitbucketserver/http-access-tokens-939515499.html#HTTPaccesstokens-CreateHTTPaccesstokens) to generate a new user access token for your repository with the **Repository write** permission.

<h3>Configure Bitbucket Data Center in Camunda Hub</h3>

1. In Camunda Hub, navigate to the project you want to connect to Bitbucket Data Center, and click **Connect repository**.

2. Select the **Bitbucket** tile at the top of the modal.

3. Fill in the **Configure Bitbucket** modal with the following information:
   - **Access token:** The user access token you generated.
   - **Bitbucket API Base URL:** The base URL of your [Bitbucket installation's REST API](https://developer.atlassian.com/server/bitbucket/rest/v1000/intro/#structure-of-the-rest-uris), for example `https://bitbucket.example.com/rest/api/latest`. This is required for Bitbucket Data Center instances. If left empty, Camunda Hub uses the default Bitbucket Cloud REST API URL (`https://api.bitbucket.org/2.0/repositories`).

**Note**
     If you're using a self-hosted Bitbucket Data Center instance, see [Self-Managed Git sync](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#git-sync) for configuration details.

     Refer to [Bitbucket documentation](https://developer.atlassian.com/server/bitbucket/rest/v1000/intro/#structure-of-the-rest-uris) for more information.

   - **Repository URL:** The base URL of the repository you want to sync with, e.g., `https://bitbucket.example.com/projects/camunda/repos/example-repo`. The URL must not include the `.git` extension or any folder path. For personal repositories, use `~{user}` as the project ID (for example, `projects/~alice/repos/example-repo`).
   - **Branch name:** The branch to use for merging and managing changes.
   - **Repository path:** (optional) The folder path containing your project files. If left empty, Camunda Hub syncs with the repository root. This path will be created automatically if it does not exist.

4. Click **Open repository** to test your configuration. The repository for the specified branch and optional path will open in a new tab.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/git-sync
