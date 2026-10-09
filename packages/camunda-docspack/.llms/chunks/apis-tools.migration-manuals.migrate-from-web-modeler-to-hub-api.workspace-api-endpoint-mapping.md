# Migrate from Web Modeler to the Camunda Hub API — Workspace API — Endpoint mapping

All workspace API endpoints have a Camunda Hub API v2 equivalent:

| Operation          | Web Modeler API v1                | Camunda Hub API v2                     |
| ------------------ | --------------------------------- | -------------------------------------- |
| Create a workspace | `POST /v1/projects`               | `POST /v2/workspaces`                  |
| Get a workspace    | `GET /v1/projects/{projectId}`    | `GET /v2/workspaces/{workspaceKey}`    |
| Update a workspace | `PATCH /v1/projects/{projectId}`  | `PATCH /v2/workspaces/{workspaceKey}`  |
| Delete a workspace | `DELETE /v1/projects/{projectId}` | `DELETE /v2/workspaces/{workspaceKey}` |
| Search workspaces  | `POST /v1/projects/search`        | `POST /v2/workspaces/search`           |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
