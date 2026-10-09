# Property reference — Configuration of the `restapi` component — env

| Provider      | Environment variable                          | Description                                                                                                                   | Default value                                 |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| All providers | `CAMUNDA_HUB_GITSYNC_MAXFILES`                | Maximum number of allowed files for sync operations.                                                                          | `100`                                         |
| All providers | `CAMUNDA_HUB_GITSYNC_MAXINMEMORYSIZE`         | Maximum memory size that can be processed by calls to the Git provider. This limits the maximum file size that can be synced. | `4MB`                                         |
| GitHub        | `CAMUNDA_HUB_GITSYNC_GITHUB_BASEURL`          | The base URL of your self-hosted GitHub instance.                                                                             | `https://api.github.com`                      |
| GitLab        | `CAMUNDA_HUB_GITSYNC_GITLAB_BASEURL`          | The base URL of your self-hosted GitLab instance.                                                                             | `https://gitlab.com/api/v4`                   |
| Azure DevOps  | `CAMUNDA_HUB_GITSYNC_AZURE_BASEURL`           | The base URL of your self-hosted Azure DevOps Server instance.                                                                | `https://dev.azure.com`                       |
| Azure DevOps  | `CAMUNDA_HUB_GITSYNC_AZURE_APIVERSION`        | The Azure DevOps API versions to use.                                                                                         | `7.1`                                         |
| Azure DevOps  | `CAMUNDA_HUB_GITSYNC_AZURE_AUTHORITYBASEPATH` | URL used to access authentication and authorization services for Microsoft cloud identities.                                  | `https://login.microsoftonline.com`           |
| Azure DevOps  | `CAMUNDA_HUB_GITSYNC_AZURE_SCOPE`             | OAuth scope requested for Azure DevOps authentication.                                                                        | `https://app.vssps.visualstudio.com/.default` |
| Bitbucket     | `CAMUNDA_HUB_GITSYNC_BITBUCKET_BASEURL`       | The base URL of Bitbucket Cloud.                                                                                              | `https://api.bitbucket.org/2.0/repositories`  |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
