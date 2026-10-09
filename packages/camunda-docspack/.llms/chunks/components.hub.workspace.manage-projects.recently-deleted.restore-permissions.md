# Recover deleted resources — Restore permissions

Only a **Workspace Admin** at the time of the restore attempt can restore a recently deleted workspace. A **Workspace Admin** or **Editor** can restore all other resource types. The role at the time of the original deletion is not considered.

Read more about [access rights and permissions](https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members#workspace-roles).


## Browse recently deleted resources

In Camunda Hub, in the left-hand navigation, click **Recently deleted**. This page lists all resources deleted within the last 30 days.

Each row shows:

| Column             | Description                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**           | The resource name                                                                                                                                               |
| **Type**           | The type of deleted resource                                                                                                                                    |
| **Location**       | The full path of the resource's current live ancestors as a breadcrumb. Composed at read time, so renames or moves of live ancestors are reflected immediately. |
| **Deleted by**     | The user who performed the deletion                                                                                                                             |
| **Deleted on**     | The date and time of the deletion                                                                                                                               |
| **Days remaining** | Days left before permanent deletion                                                                                                                             |

By default, the list is sorted with the most recently deleted resources first.

If the recently deleted resource is a parent, such as a folder or project, you can expand the row to reveal the child resources deleted with it.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/recently-deleted
