# Process application management in Web Modeler API v1 — Projects API — Process applications are never returned as parent folders

In the `GET /api/v1/projects/{projectId}` response, the `content.folders[i].parentId` and `content.files[i].folderId` are null for any folder or file stored at the root of a process application. Previously, `parentId` and `folderId` would return the process application ID. The process application ID is, instead, returned in a new `processApplicationId` field.

Example:

```json
{
  "metadata": {
    "id": "fb928277-6268-44bb-b3e6-1925fa730ecf",
    "name": "Project",
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
  "content": {
    "folders": [
      {
        "id": "cdcf3895-1061-4084-b97e-c0abaab59b6f",
        "name": "Root folder",
        "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
        "parentId": null, // null if the parent container is a process application
        "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd", // new process application field
        "created": "2026-08-24T14:37:04.36503Z",
        "createdBy": {
          "name": "Jane Doe",
          "email": "jane.doe@email.com"
        },
        "updated": "2026-08-24T14:37:07.470563Z",
        "updatedBy": {
          "name": "Jane Doe",
          "email": "jane.doe@email.com"
        }
      }
    ],
    "files": [
      {
        "id": "5a6aa24f-844b-4da2-9118-007f5c1a2df7",
        "name": "Root file",
        "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
        "folderId": null, // null if the parent container is a process application
        "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd", // new process application field
        "simplePath": "Root file.bpmn",
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
      },
      {
        "id": "ed043868-556f-4a93-97dc-3cba1652363c",
        "name": "Nested file",
        "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
        "folderId": "cdcf3895-1061-4084-b97e-c0abaab59b6f",
        "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd", // new process application field
        "simplePath": "Root folder/Nested file.bpmn",
        "canonicalPath": [
          {
            "id": "cdcf3895-1061-4084-b97e-c0abaab59b6f",
            "name": "Root folder"
          }
        ],
        "revision": 3,
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
    ],
    "processApplications": [
      {
        "id": "e005e49a-dce8-42ee-b0db-30b1d5555ebd",
        "name": "Process application",
        "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
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
    ]
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/web-modeler-v1-apis
