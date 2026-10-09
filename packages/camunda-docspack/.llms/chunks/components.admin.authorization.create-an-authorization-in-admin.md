# Authorizations — Create an authorization in Admin

To create a new authorization:

1. Log in to Admin, and select the **Authorizations** tab.
2. Select a resource type from the list on the left, and select **Create authorization**.
3. Enter the following information:
   - **Owner type**: The entity to which you want to assign permissions, such as a user, group, role, client, or mapping rule.
   - **Owner ID**: The ID of the owner.
   - **Resource type**: The selected resource type.
   - **Resource scope**: Choose how this authorization is scoped:
     - By **Resource ID**, or
     - For `USER_TASK`, by **Resource property name** with the `PROPERTY` matcher.
   - **Resource ID**: The ID of the resource within the selected resource type. Use `*` to grant permissions for all resources of that type.
   - **Resource property name** _(USER_TASK only)_: The task property used when scoping access with the `PROPERTY` matcher. Supported values are:
     - `assignee`
     - `candidateUsers`
     - `candidateGroups`

   Only one of **Resource ID** or **Resource property name** can be specified.
   If you use a resource property, set the matcher to `PROPERTY`.

4. Select the permissions you want to grant.
5. Click **Create authorization**.

The authorization is created, and the owner is granted the specified permissions.

---
Source: https://docs.camunda.io/docs/next/components/admin/authorization
