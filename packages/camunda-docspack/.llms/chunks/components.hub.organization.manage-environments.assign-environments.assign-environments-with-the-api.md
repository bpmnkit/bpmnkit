# Assign environments to a workspace — Assign environments with the API

Use the Camunda Hub API to assign environments as part of your workspace setup or team onboarding automation. The API follows the same rules as the user interface.

| Method | Path                                      | Description                                                                |
| :----- | :---------------------------------------- | :------------------------------------------------------------------------- |
| `GET`  | `/environments`                           | List the environments in your organization.                                |
| `GET`  | `/workspaces/{workspaceKey}/environments` | List the environments assigned to a workspace.                             |
| `PUT`  | `/workspaces/{workspaceKey}/environments` | Replace the environments assigned to a workspace with the ones you send.   |
| `GET`  | `/projects/{projectKey}/environments`     | List the environments a project can use. This is the set of its workspace. |

The `PUT` request takes an `environmentIds` list of up to 500 environment IDs, and replaces the complete set. To unassign an environment, send the list without it. To unassign all environments, send an empty list.

See the API reference for [SaaS](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/update-workspace-environments.api) and [Self-Managed](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/update-workspace-environments.api).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments
