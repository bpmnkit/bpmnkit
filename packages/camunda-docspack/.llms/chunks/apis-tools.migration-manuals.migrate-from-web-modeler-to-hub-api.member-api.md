# Migrate from Web Modeler to the Camunda Hub API — Member API

In Camunda Hub API v2, the collaborators API has been renamed to `members`. The following sections cover changes that apply to the member API endpoints.

### Endpoint mapping

All member API endpoints have a Camunda Hub API v2 equivalent:

| Operation             | Web Modeler API v1                                      | Camunda Hub API v2                                     |
| --------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Add a collaborator    | `PUT /v1/collaborators`                                 | `POST /v2/workspaces/{workspaceKey}/members`           |
| Remove a collaborator | `DELETE /v1/projects/{projectId}/collaborators/{email}` | `DELETE /v2/workspaces/{workspaceKey}/members/{email}` |
| Search collaborators  | `POST /v1/collaborators/search`                         | `POST /v2/members/search`                              |

### Field mapping {#member-api-field-mapping}

The following fields have changed across all member endpoints:

| Web Modeler API v1 | Camunda Hub API v2 | Application      | Notes    |
| ------------------ | ------------------ | ---------------- | -------- |
| `projectId`        | `workspaceKey`     | Request/response | Renamed. |

### Add a member

In Web Modeler API v1, the method is `PUT`, and the `projectId` is in the request body:

```bash title="Web Modeler API v1"
PUT /api/v1/collaborators
{
    "email": "jane.doe@email.com",
    "projectId": "b9b57035-fbce-4412-a7d5-9f0df61ed74d",
    "role": "viewer"
}
```

In Camunda Hub API v2, the method is `POST`, and the workspace key is in the path:

```bash title="Camunda Hub API v2"
POST /api/v2/workspaces/b9b57035-fbce-4412-a7d5-9f0df61ed74d/members
{
    "email": "jane.doe@email.com",
    "role": "viewer"
}
```

### Search members

In addition to the [general field changes](#member-api-field-mapping), the following request fields have changed:

| Web Modeler API v1 | Camunda Hub API v2    | Notes                                                                                           |
| ------------------ | --------------------- | ----------------------------------------------------------------------------------------------- |
| `filter`           | `filter`              | Now uses [advanced operators](#search-filters), including `$eq`, `$in`, and `$like`             |
| `filter.projectId` | `filter.workspaceKey` | Renamed. In v2, `filter.workspaceKey` is required. Members can't be searched across workspaces. |
| `sort.direction`   | `sort.order`          | Renamed                                                                                         |

The following example shows a v1 request:

```json title="Web Modeler API v1"
{
  "filter": {
    "projectId": "b9b57035-fbce-4412-a7d5-9f0df61ed74d",
    "role": "project_admin"
  },
  "sort": {
    "field": "name",
    "direction": "DESC"
  }
}
```

The equivalent v2 request:

```json title="Camunda Hub API v2"
{
  "filter": {
    "workspaceKey": { "$eq": "b9b57035-fbce-4412-a7d5-9f0df61ed74d" },
    "role": { "$eq": "workspace_admin" }
  },
  "sort": {
    "field": "name",
    "order": "DESC"
  }
}
```

### Role enum

| Web Modeler API v1 | Camunda Hub API v2 | Notes                                  |
| ------------------ | ------------------ | -------------------------------------- |
| `project_admin`    | `workspace_admin`  | Renamed to match workspace terminology |
| `editor`           | `editor`           | Unchanged                              |
| `commenter`        | `commenter`        | Unchanged                              |
| `viewer`           | `viewer`           | Unchanged                              |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
