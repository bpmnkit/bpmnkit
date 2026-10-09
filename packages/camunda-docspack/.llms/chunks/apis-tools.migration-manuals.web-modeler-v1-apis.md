# Process application management in Web Modeler API v1

Learn about changes to process application management in Web Modeler API v1.


## About these changes

In Camunda 8.9, process applications were not explicitly exposed in Web Modeler API v1. There were no process application endpoints.

However, process applications were implicitly accessible as folders. For example:

- You could pass a process application ID to `DELETE /api/v1/folders/{folderId}` to delete the process application.
- The response for `GET /api/v1/folders/{folderId}` returns a `parentId`, representing the folder's parent folder. If the parent is in a process application, rather than another folder, the process application ID is returned.

Camunda 8.10 changes how resources are organized. Review [structure and terminology](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api#structure-and-terminology) for an explanation of these changes. To support the new file hierarchy, two major changes have been introduced to Web Modeler API v1:

- Process applications are no longer implicitly accessible via v1 folders, files, and project APIs.
- New process application APIs and changes to existing APIs are introduced to make access explicit.

**Note: DEPRECATED**
Web Modeler API v1 is deprecated in Camunda 8.10 and will be removed in 8.12. [Migrate to Camunda Hub REST API v2](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api).

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/web-modeler-v1-apis
