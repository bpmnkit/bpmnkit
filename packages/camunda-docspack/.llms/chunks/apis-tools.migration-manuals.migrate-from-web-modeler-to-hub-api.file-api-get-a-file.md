# Migrate from Web Modeler to the Camunda Hub API — File API — Get a file

The v1 response returns a nested structure, with `metadata` and `content` as separate top-level fields:

```json title="Web Modeler API v1"
{
  "metadata": {
    "id": "57f4635b-5452-44a5-9020-bfce455484ab",
    "name": "process",
    "projectId": "b9b57035-fbce-4412-a7d5-9f0df61ed74d",
    "folderId": "62132025-57ff-4077-8c80-fc4ebe84aebe",
    "simplePath": "Process application/Parent folder/Child folder/process.bpmn",
    "canonicalPath": [
      {
        "id": "1abf0198-3462-4fd2-a0e9-362f213d81d0",
        "name": "Process application"
      },
      {
        "id": "b06c97f5-7e39-4108-b947-2848fdc023f0",
        "name": "Parent folder"
      },
      {
        "id": "62132025-57ff-4077-8c80-fc4ebe84aebe",
        "name": "Child folder"
      }
    ],
    "revision": 5,
    "type": "BPMN",
    "created": "2026-07-08T09:59:34.262858Z",
    "createdBy": {
      "name": "...",
      "email": "..."
    },
    "updated": "2026-07-08T10:05:09.045782Z",
    "updatedBy": {
      "name": "...",
      "email": "..."
    }
  },
  "content": "..."
}
```

The v2 response is a flat object:

```json title="Camunda Hub API v2"
{
  "fileKey": "57f4635b-5452-44a5-9020-bfce455484ab",
  "name": "process",
  "projectKey": "1abf0198-3462-4fd2-a0e9-362f213d81d0",
  "folderKey": "62132025-57ff-4077-8c80-fc4ebe84aebe",
  "simplePath": "Parent folder/Child folder/process.bpmn",
  "canonicalPath": "b06c97f5-7e39-4108-b947-2848fdc023f0/62132025-57ff-4077-8c80-fc4ebe84aebe",
  "revision": 5,
  "type": "bpmn",
  "content": "...",
  "created": "2026-07-08T09:59:34.262858Z",
  "createdBy": {
    "name": "...",
    "email": "..."
  },
  "updated": "2026-07-08T10:05:09.045782Z",
  "updatedBy": {
    "name": "...",
    "email": "..."
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
