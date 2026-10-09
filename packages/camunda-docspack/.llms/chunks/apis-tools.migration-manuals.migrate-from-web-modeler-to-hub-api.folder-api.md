# Migrate from Web Modeler to the Camunda Hub API — Folder API

The following sections cover changes that apply to folder API endpoints.

### Endpoint mapping

All folder API endpoints have a Camunda Hub API v2 equivalent:

| Operation       | Web Modeler API v1              | Camunda Hub API v2               |
| --------------- | ------------------------------- | -------------------------------- |
| Create a folder | `POST /v1/folders`              | `POST /v2/folders`               |
| Get a folder    | `GET /v1/folders/{folderId}`    | `GET /v2/folders/{folderKey}`    |
| Update a folder | `PATCH /v1/folders/{folderId}`  | `PATCH /v2/folders/{folderKey}`  |
| Delete a folder | `DELETE /v1/folders/{folderId}` | `DELETE /v2/folders/{folderKey}` |

### Field mapping {#folder-api-field-mapping}

The following fields have changed across all folder endpoints:

| Web Modeler API v1 | Camunda Hub API v2 | Application      | Notes                                                                                                                                                                                                                                                                                                                |
| ------------------ | ------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentId`         | `parentFolderKey`  | Request/response | Renamed. If the folder is at the root of a project (["process application" before Camunda 8.10](#structure-and-terminology)), v1 endpoints return the project ID, and v2 endpoints return `null`.                                                                                                                    |
| `projectId`        | `projectKey`       | Request/response | In v1, `projectId` refers to the ID of the workspace ([called "project" before Camunda 8.10](#structure-and-terminology)). In v2, the workspace key is no longer available. Instead, `projectKey` refers to the key of the project ([called "process application" before Camunda 8.10](#structure-and-terminology)). |
| `id`               | `folderKey`        | Response         | Renamed                                                                                                                                                                                                                                                                                                              |

### Get a folder

In Web Modeler API v1, folder data in the response is nested under a `metadata` key:

```json title="Web Modeler API v1"
{
  "metadata": {
    "id": "b06c97f5-7e39-4108-b947-2848fdc023f0",
    "name": "Parent folder",
    "projectId": "b9b57035-fbce-4412-a7d5-9f0df61ed74d",
    "parentId": "1abf0198-3462-4fd2-a0e9-362f213d81d0",
    "created": "2026-07-08T09:59:30.719344Z",
    "updated": "2026-07-08T10:04:56.47393Z",
    "createdBy": {
      "name": "...",
      "email": "..."
    },
    "updatedBy": {
      "name": "...",
      "email": "..."
    }
  },
  "content": {
    "folders": [],
    "files": []
  }
}
```

In Camunda Hub API v2, folder data is nested under a `folder` key:

```json title="Camunda Hub API v2"
{
  "folder": {
    "folderKey": "b06c97f5-7e39-4108-b947-2848fdc023f0",
    "name": "Parent folder",
    "projectKey": "1abf0198-3462-4fd2-a0e9-362f213d81d0",
    "parentFolderKey": null,
    "created": "2026-07-08T09:59:30.719344Z",
    "createdBy": {
      "name": "...",
      "email": "..."
    },
    "updated": "2026-07-08T10:04:56.47393Z",
    "updatedBy": {
      "name": "...",
      "email": "..."
    }
  },
  "content": {
    "folders": [],
    "files": []
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
