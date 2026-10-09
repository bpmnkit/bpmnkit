# Recover deleted resources — Restore a resource

To restore a recently deleted resource:

1. In the left-hand navigation, click **Recently deleted**.
2. Find the resource you want to restore.
3. Click the restore icon at the end of the resource's row.

The resource returns to its original location.

### Parent resources

If you restore a parent resource, the resources deleted with it are also restored. Child resources that once belonged to the parent resource but were deleted independently are not affected.

### Child resources

You can restore a child resource without restoring its parent folder or project. Since the child can't be restored to its original location, it's placed in a new folder at the workspace root using the template `${fileName} - restored`. The actual folder name is presented in the confirmation modal when you restore the resource.

If the workspace has been deleted, you must restore the workspace before you can restore any of its child resources. Similarly, you must restore an IDP application before you can restore its IDP projects.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/recently-deleted
