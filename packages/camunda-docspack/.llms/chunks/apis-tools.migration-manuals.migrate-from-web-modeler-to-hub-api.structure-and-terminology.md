# Migrate from Web Modeler to the Camunda Hub API — Structure and terminology

Camunda 8.10 changes how resources are organized.

Before Camunda 8.10, Web Modeler resources were organized like this:

```
Organization
├─ Project
│  ├─ Process application
│  │   ├─ File
│  │   └─ Folder
│  │      └─ File
│  ├─ Folder
│  │   └─ File
│  └─ File
└─ Project
```

Organizations had projects. Projects optionally contained process applications, folders, and files.

Starting with Camunda 8.10, Camunda Hub resources are organized like this:

```
Organization
└─ Workspace
   ├─ Project
   │  ├─ Folder
   │  │   ├─ File
   │  │   └─ Folder
   │  └─ File
   └─ Project
```

Organizations have workspaces. Workspaces contain projects. Projects optionally contain folders and files.

The new structure introduces the following terminology changes:

| Web Modeler (\<8.10) | Camunda Hub (8.10+) | Notes                                                                                                                                                                                             |
| :------------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Project              | Workspace           | Files and folders can no longer be created at the workspace level.                                                                                                                                |
| Process application  | Project             | Process applications weren't explicitly exposed in Web Modeler API v1. In Camunda Hub API v2, there is a dedicated [project API](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/create-project.api). |

In Camunda Hub API v2, the endpoint paths, field names, and underlying data all reflect the structural and terminology changes. In Web Modeler API v1 running on Camunda 8.10+, only the underlying data reflects the new organization. The sections below identify all affected endpoints and fields.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
