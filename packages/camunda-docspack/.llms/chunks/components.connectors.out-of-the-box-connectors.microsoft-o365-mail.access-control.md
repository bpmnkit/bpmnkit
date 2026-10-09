# Microsoft 365 connector — Access control

Each operation requires permissions to be assigned by a system administrator. Learn more about [Microsoft permissions](https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview).

**Warning**
By default, an application with Mail API permissions can access _all mailboxes_ in your organization. To restrict access to specific mailboxes, use _Role-Based Access Control (RBAC) for Applications_. Learn more about [scoping application permissions to specific Exchange Online mailboxes](https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access).

### Bearer token authentication

If you own a bearer token, in the **Authentication** section select **Bearer token** in the **Type** field.
Enter a bearer token in the field **Bearer token**. Use [secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to avoid exposing sensitive credentials.

**Note**
The default time-to-live (TTL) for bearer tokens is 3600 seconds. Therefore, this approach might not work for long-living and/or repetitive processes.

### OAuth2 client credentials flow authentication

**Note**
In the client credential flow, an application gets access to all accounts associated with the organization.
For example, if an app has permissions `Mail.Read`, it will be able to read emails of all users.

To proceed with this step, you'll need the following data:

- OAuth 2.0 token endpoint
- Client ID (Application ID)
- Client secret; can be created on your application page

The app must be assigned to a user.

If you own a bearer token, in the **Authentication** section select **OAuth 2.0** in the **Type** field.
Enter the above data into the respective fields.

Learn more about [creating, configuring, and authorizing Microsoft App](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail
