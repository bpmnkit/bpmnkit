# Authorizations — User task authorizations

To support fine-grained access to user tasks in Tasklist and the Orchestration Cluster REST API, Admin provides a **USER_TASK** resource type with the following permissions:

- `READ`: View the task and its properties.
- `UPDATE`: Perform updates on the task (for example, change assignment, due dates, or candidate users or groups).
- `CLAIM`: Claim a task from a pool of candidate users or groups.
- `COMPLETE`: Complete the task, with or without variables.

### Configure property-based user task authorizations

With property-based user task authorizations, you can grant permissions based on task assignment rather than a specific task ID. A user is authorized when their username or group membership matches a corresponding task property.

To create a property-based user task authorization:

1. Log in to Admin, and select the **Authorizations** tab.
2. Create a new authorization for the `USER_TASK` resource type.
3. Specify the **Owner type** and **Owner ID** (for example, a role that represents task workers).
4. Set the matcher to `PROPERTY`.
5. Select the task property used to scope access:
   - `assignee`
   - `candidateUsers`
   - `candidateGroups`
6. Select the permissions to grant (for example `READ`, `CLAIM`, and `COMPLETE`).
7. Create the authorization.

You can't combine multiple task properties in a single authorization. To cover all three properties (`assignee`, `candidateUsers`, `candidateGroups`), create one authorization per property.

### Authorization for user tasks

You can control access to user tasks using a combination of process-level and task-level permissions:

- Process-level permissions on the `Process Definition` resource, such as `READ_USER_TASK`, `CLAIM_USER_TASK`, `COMPLETE_USER_TASK`, and `UPDATE_USER_TASK`.
- Task-level permissions on the `USER_TASK` resource, such as `READ`, `UPDATE`, `CLAIM`, and `COMPLETE`, which are typically scoped using property-based access control on task properties such as `assignee`, `candidateUsers`, and `candidateGroups`.

When both process-level and task-level permissions exist, process-level permissions take precedence.
If a user already has the required `Process Definition` permission for an operation (for example, `READ_USER_TASK`, `CLAIM_USER_TASK`, `COMPLETE_USER_TASK`, or `UPDATE_USER_TASK`), the system does not evaluate `USER_TASK` permissions for that operation.
Task-level `USER_TASK` permissions are evaluated only when no effective process‑level permission exists for that user and process definition.

For Tasklist-specific behavior and practical authorization patterns, see [User task authorization in Tasklist](https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization).

### Authorization examples

#### Supervisor: broad process-level access

To allow a supervisor to see and manage all user tasks for one or more processes:

- Resource type: `PROCESS_DEFINITION`
- Resource scope: by **Resource ID**
- Resource ID: `*` (or a specific BPMN process ID)
- Permissions: `READ_USER_TASK`, `UPDATE_USER_TASK`, `CLAIM_USER_TASK`, `COMPLETE_USER_TASK`

This grants broad visibility and control over all user tasks for the selected processes, without needing task-level authorizations.

#### Task worker: property-based access

The default task worker role is created with property-based user task authorizations:

- Role ID: `task-worker`
- Resource type: `USER_TASK`
- Resource scope: by **Resource property name** (`PROPERTY` matcher)
- Property name: `assignee`, `candidateUsers`, or `candidateGroups`
- Permissions: `READ`, `CLAIM`, `COMPLETE`

This ensures that task workers can only see, claim, and complete tasks where they are the assignee, a candidate user, or in a candidate group.

**Note**
Default roles, including task worker, are recreated each time the cluster starts and are not customizable.
To adjust permissions, create and manage custom roles instead.

---
Source: https://docs.camunda.io/docs/next/components/admin/authorization
