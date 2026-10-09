# Process application management in Web Modeler API v1 — Files API

You can no longer access process applications as folders in any files API context. Instead, process applications are now explicitly represented.

### Folder ID must reference a folder

In files API requests, you'll receive a `404 NOT FOUND` if you pass a process application ID as the `folderId`. Previously, you could pass a process application's ID to place the file in the process application. Use the new `processApplicationId` field to specify the target process application and, optionally, the `folderId` field to specify a target folder.

```shell
POST /api/v1/files
{
  "name": "New BPMN diagram",
  "folderId": "cdcf3895-1061-4084-b97e-c0abaab59b6f",  # must be a folder, not a process application
  "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd",  # new process application field
  "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
  "content": "...",
  "fileType": "BPMN"
}
```

Affected endpoints:

- `PATCH /api/v1/files/{fileId}`
- `POST /api/v1/files`

### Process applications are never returned as folders

In files API responses, the `folderId` is null for any file stored at the root of a process application. Previously, `folderId` would return the process application ID. The process application ID is, instead, returned in a new `processApplicationId` field.

Example:

```json
{
  "id": "5cafbf6a-d5d8-4ed2-8dae-b950ce3597c3",
  "name": "New BPMN diagram",
  "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
  "folderId": null, // null if the parent container is a process application
  "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd", // new process application field
  "simplePath": "New BPMN diagram.bpmn",
  "canonicalPath": [],
  "revision": 2,
  "type": "BPMN",
  "created": "2026-08-24T14:17:33.889317Z",
  "createdBy": {
    "name": "Jane Doe",
    "email": "jane.doe@email.com"
  },
  "updated": "2026-08-24T14:23:48.371161659Z",
  "updatedBy": {
    "name": "Jane Doe",
    "email": "jane.doe@email.com"
  }
}
```

Affected endpoints:

- `GET /api/v1/files/{fileId}`
- `PATCH /api/v1/files/{fileId}`
- `POST /api/v1/files/search`
- `POST /api/v1/files`

### File paths exclude process applications

In files API endpoints, the `simplePath` and `canonicalPath` omit the container process application. Previously, the process application was included if it was on the path.

Example:

```json
{
  "metadata": {
    "id": "ed043868-556f-4a93-97dc-3cba1652363c",
    "name": "New BPMN diagram",
    "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
    "folderId": "cdcf3895-1061-4084-b97e-c0abaab59b6f",
    "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd", // new process application field
    "simplePath": "Root folder/New BPMN diagram.bpmn", // excludes process applications
    "canonicalPath": [
      // excludes process applications
      {
        "id": "cdcf3895-1061-4084-b97e-c0abaab59b6f",
        "name": "Root folder"
      }
    ],
    "revision": 2,
    "type": "BPMN",
    "created": "2026-08-24T17:35:46.329162Z",
    "createdBy": {
      "name": "Jane Doe",
      "email": "jane.doe@email.com"
    },
    "updated": "2026-08-24T17:35:46.330218Z",
    "updatedBy": {
      "name": "Jane Doe",
      "email": "jane.doe@email.com"
    }
  },
  "content": "..."
}
```

Affected endpoints:

- `GET /api/v1/files/{fileId}`
- `PATCH /api/v1/files/{fileId}`
- `POST /api/v1/files/search` (the process application is excluded from these paths in both the response and the request `filter`)
- `POST /api/v1/files`

### Search for files in a process application

With `POST /api/v1/files/search`, you can now use a new `processApplicationId` filter.

Example:

```shell
POST /api/v1/files/search
{
  "filter": {
    "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/web-modeler-v1-apis
