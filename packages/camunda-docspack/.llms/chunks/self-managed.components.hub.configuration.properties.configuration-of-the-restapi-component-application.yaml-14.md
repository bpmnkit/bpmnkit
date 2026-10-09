# Property reference — Configuration of the `restapi` component — application.yaml

| Provider      | Property                                         | Description                                                                                                                   | Default value                                 |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| All providers | `camunda.hub.git-sync.max-files`                 | Maximum number of allowed files for sync operations.                                                                          | `100`                                         |
| All providers | `camunda.hub.git-sync.max-in-memory-size`        | Maximum memory size that can be processed by calls to the Git provider. This limits the maximum file size that can be synced. | `4MB`                                         |
| GitHub        | `camunda.hub.git-sync.github.base-url`           | The base URL of your self-hosted GitHub instance.                                                                             | `https://api.github.com`                      |
| GitLab        | `camunda.hub.git-sync.gitlab.base-url`           | The base URL of your self-hosted GitLab instance.                                                                             | `https://gitlab.com/api/v4`                   |
| Azure DevOps  | `camunda.hub.git-sync.azure.base-url`            | The base URL of your self-hosted Azure DevOps Server instance.                                                                | `https://dev.azure.com`                       |
| Azure DevOps  | `camunda.hub.git-sync.azure.api-version`         | The Azure DevOps API versions to use.                                                                                         | `7.1`                                         |
| Azure DevOps  | `camunda.hub.git-sync.azure.authority-base-path` | URL used to access authentication and authorization services for Microsoft cloud identities.                                  | `https://login.microsoftonline.com`           |
| Azure DevOps  | `camunda.hub.git-sync.azure.scope`               | OAuth scope requested for Azure DevOps authentication.                                                                        | `https://app.vssps.visualstudio.com/.default` |
| Bitbucket     | `camunda.hub.git-sync.bitbucket.base-url`        | The base URL of Bitbucket Cloud.                                                                                              | `https://api.bitbucket.org/2.0/repositories`  |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
