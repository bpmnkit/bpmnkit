# Authorizations — Change an existing authorization

**Tip**
Partial wildcard matching, for example `my-resource*`, is not supported.


## Update an authorization

Authorizations cannot be updated after they are created.

To edit an authorization, [delete](#delete-an-authorization) the existing one, and create a new authorization with the updated permissions.


## Delete an authorization

Delete an authorization by completing the following steps:

1. Log in to Admin, and select the **Authorizations** tab.
2. Select the resource type of the authorization you want to delete.
3. In the list, find the authorization you want to remove and click **Delete**.
4. Confirm the deletion by clicking **Delete** in the confirmation dialog.

The authorization is deleted, and the owner no longer has the permissions granted by it.

**Caution**
Deleting an authorization is permanent and can't be undone.

---
Source: https://docs.camunda.io/docs/next/components/admin/authorization
