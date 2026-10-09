# Process application management in Web Modeler API v1 — Folders API

You can no longer access process applications as folders in any folders API context. Instead, process applications are now explicitly represented.

### Folder IDs reference folders

In folders API requests, you'll receive a `404 NOT FOUND` if you pass a process application ID as the `folderId`. Previously, you could pass a process application's ID when deleting, reading, and updating folders.

Example:

```shell
GET /api/v1/folders/1ef492f5-7ddc-43a7-b5e2-f5ad5c14b676  # must be a folder, not a process application
```

Affected endpoints:

- `DELETE /api/v1/folders/{folderId}`
- `GET /api/v1/folders/{folderId}`
- `PATCH /api/v1/folders/{folderId}`

Instead of passing the process application ID to the folders endpoints, use the new process application endpoints:

- [`DELETE /api/v1/process-applications/{processApplicationId}`](https://modeler.camunda.io/swagger-ui/index.html#/Process%20Applications/deleteProcessApplication)
- [`GET /api/v1/process-applications/{processApplicationId}`](https://modeler.camunda.io/swagger-ui/index.html#/Process%20Applications/getProcessApplication)
- [`PATCH /api/v1/process-applications/{processApplicationId}`](https://modeler.camunda.io/swagger-ui/index.html#/Process%20Applications/updateProcessApplication)

Example:

```shell
GET /api/v1/process-applications/e005e49a-dce8-42ee-b0db-30b1d5555ebd  # must be a process application, not a folder
```

### Parent IDs reference folders

In folders API requests, you'll receive a `404 NOT FOUND` if you pass a process application ID as the `parentId`. Previously, you could pass a process application's ID when writing data. Use the new `processApplicationId` field to specify the target process application and, optionally, the `parentId` field to specify a target folder.

Example:

```shell
POST /api/v1/folders
{
  "name": "Nested folder",
  "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
  "parentId": "1ef492f5-7ddc-43a7-b5e2-f5ad5c14b676",  # must be a folder, not a process application
  "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd"  # new process application field
}
```

Affected endpoints:

- `PATCH /api/v1/folders/{folderId}`
- `POST /api/v1/folders`

### Process applications are never returned as parent folders

In folders API responses, the `parentId` is null for any folder stored at the root of a process application. Previously, `parentId` would return the process application ID. The process application ID is, instead, returned in a new `processApplicationId` field.

Example:

```json
{
  "id": "f169a3d4-056b-463c-b4c9-6c3600c2213a",
  "name": "Root folder",
  "projectId": "58a93bf7-4ea0-4e56-85fa-5c8fccc3877d",
  "parentId": null, // null if the parent container is a process application
  "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd", // new process application field
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

- `GET /api/v1/folders/{folderId}`
- `PATCH /api/v1/folders/{folderId}`
- `POST /api/v1/folders`

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/web-modeler-v1-apis
