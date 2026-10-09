# GitHub connector — Authentication

In the **Authentication** section, select an **Authentication type** from the dropdown:

- **Personal Access Token**: Use a personal access token for authentication.
- **GitHub App**: Use a GitHub App for authentication.

### PAT

If you select **PAT**, provide the following:

- **GitHub Personal token**: Your personal access token.

### GitHub App

If you select **GitHub App**, provide the following:

- **Private key**: The private key of your GitHub App. It is recommended to use [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to store this value securely.
- **App ID**: The ID of your GitHub App.
- **Installation ID**: The installation ID of your GitHub App. Refer to the [GitHub documentation](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation#generating-an-installation-access-token) for more information on how to obtain the installation ID.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
