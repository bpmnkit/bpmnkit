# Manage workspace members — Add members

Add members to grant access to workspace resources:

1. In Camunda Hub, navigate to **Workspaces**.
2. Find the workspace, and click **Manage**.
3. Under **Members**, click **Add members**.
4. Provide names or email addresses. **(SaaS only)** Alternatively, click the email address input field, and select **All users in the organization**.
5. Select the workspace role, and optionally provide an invitation message.
6. Click **Add**.

The members will be added to the workspace and notified via email. Users without email addresses will not receive any kind of notification about workspace invitations.

**Note**
If the individual is not a user in your organization, they will first receive an organization invitation. After accepting the invitation and logging into Camunda Hub, they will be added to the workspace. They will have a "pending" label in the members list until they accept.

For Self-Managed non-production installations, the number of members per workspace is [limited to **five**](https://docs.camunda.io/docs/next/reference/licenses#web-modeler), including the workspace administrator.

**Tip**
In Self-Managed, you can [hide the **Add members** button](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#feature-flags) for non-organization admins.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-workspaces/manage-workspace-members
