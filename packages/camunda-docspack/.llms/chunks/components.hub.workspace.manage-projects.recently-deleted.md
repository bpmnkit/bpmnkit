# Recover deleted resources

Recover deleted resources within 30 days of deletion. After 30 days, resources are permanently deleted along with their content, version history, and Git links.

Learn how to recover recently deleted resources, such as files, folders, and projects, before they're permanently removed.


## Soft deletion in Camunda Hub

When you delete a resource, it's moved to **Recently deleted**. You have 30 days to restore it before permanent deletion. The following resource types are soft deleted:

- Files
- Folders
- Projects
- Workspaces
- IDP applications
- IDP projects

If the resource is a parent resource, such as a folder or project, the child resources it contains are also moved to **Recently deleted**.

**Note**
Soft deletion only applies to resources deleted using the Camunda Hub user interface in Camunda 8.10 and later. All items deleted in earlier versions are immediately and permanently deleted, along with their data in project version history, and can't be recovered.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/recently-deleted
