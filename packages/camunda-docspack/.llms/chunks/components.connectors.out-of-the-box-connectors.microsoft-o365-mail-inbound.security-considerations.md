# Microsoft 365 email inbound connector — Security considerations

### Authentication security

The connector supports multiple authentication methods. For server-to-server scenarios without user interaction, **Client credentials** is recommended. For delegated (user-context) scenarios, use **Refresh token**. **Bearer token** is available but not recommended for polling connectors due to short token lifetimes.

All authentication methods provide:

- **Scoped permissions**: API permissions are explicitly granted to the application.
- **Auditable access**: All API calls are associated with the registered application.

### Restricting mailbox access with RBAC

**Warning**
By default, an Azure AD application with `Mail.Read` or `Mail.ReadWrite` permissions can access _all mailboxes_ in your organization. In the OAuth 2.0 client credentials flow, the application gets access to all mailboxes it has been granted permissions for.

To restrict access to specific mailboxes, use _Role-Based Access Control (RBAC) for Applications_. Learn more about [scoping application permissions to specific Exchange Online mailboxes](https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
