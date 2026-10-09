# Process application management in Web Modeler API v1 — Projects API — Project folders exclude process applications

In the `GET /api/v1/projects/{projectId}` response, `content.folders` excludes process applications. Previously, process applications were included in this list. The process applications are, instead, returned in a new `content.processApplications` field.

```json
{
  "metadata": {
    "id": "fb928277-6268-44bb-b3e6-1925fa730ecf",
    "name": "Project",
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
  "content": {
    "folders": [
      // excludes process applications
      {
        "id": "cdcf3895-1061-4084-b97e-c0abaab59b6f",
        "name": "Root folder",
        "projectId": "fb928277-6268-44bb-b3e6-1925fa730ecf",
        "parentId": null,
        "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd",
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
        "folderId": null,
        "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd",
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
        "processApplicationId": "e005e49a-dce8-42ee-b0db-30b1d5555ebd",
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
      // new process applications list
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
