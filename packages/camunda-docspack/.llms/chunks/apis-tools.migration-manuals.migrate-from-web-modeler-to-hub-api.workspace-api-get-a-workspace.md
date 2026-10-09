# Migrate from Web Modeler to the Camunda Hub API — Workspace API — Get a workspace

In Web Modeler API v1, workspace data in the response is nested under a `metadata` key with `folders` and `files` in the `content`:

```json title="Web Modeler API v1"
{
    "metadata": {
        "id": "b9b57035-fbce-4412-a7d5-9f0df61ed74d",
        "name": "Orders",
        "created": "2026-07-08T07:58:57.601559Z",
        "createdBy": {
            "name": "...",
            "email": "..."
        },
        "updated": "2026-07-08T07:59:13.386407Z",
        "updatedBy": {
            "name": "...",
            "email": "..."
        }
    },
    "content": {
        "folders": [ ... ],
        "files": [ ... ]
    }
}
```

In Camunda Hub API v2, workspace data is nested under a `workspace` key with `projects` in the `content`:

```json title="Camunda Hub API v2"
{
    "workspace": {
        "workspaceKey": "b9b57035-fbce-4412-a7d5-9f0df61ed74d",
        "name": "Orders",
        "description": null,
        "created": "2026-07-08T07:58:57.601559Z",
        "createdBy": {
            "name": "...",
            "email": "..."
        },
        "updated": "2026-07-08T07:59:13.386407Z",
        "updatedBy": {
            "name": "...",
            "email": "..."
        }
    },
    "content": {
        "projects": [ ... ]
    }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
