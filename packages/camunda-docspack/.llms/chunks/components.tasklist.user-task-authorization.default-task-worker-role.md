# User task authorization — Default task worker role

On new installations and upgrades, Camunda Identity automatically creates a default `task-worker` role.

This role grants property-based `USER_TASK` permissions:

- Permissions:
  - `READ`
  - `CLAIM`
  - `COMPLETE`
- Scoped by:
  - `assignee`
  - `candidateUsers`
  - `candidateGroups`

This lets typical task workers see, claim, and complete only the tasks they're responsible for.

You can use this role as-is or create custom roles with similar property-based authorizations.

**Note: Upgrade behavior**
When you upgrade from Camunda 8.8 to 8.9, Identity creates only the default `task-worker` role automatically.

Other roles are not created during upgrade. If needed, create additional roles in Identity and assign the appropriate permissions.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization
