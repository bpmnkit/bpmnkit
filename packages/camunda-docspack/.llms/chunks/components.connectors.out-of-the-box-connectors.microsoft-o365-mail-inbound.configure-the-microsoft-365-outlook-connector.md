# Microsoft 365 email inbound connector — Configure the Microsoft 365 Outlook connector

To use the Microsoft 365 Email Inbound connector, you must register an application in Microsoft Entra (formerly Azure AD) and configure the required permissions.

**Note**
This is a simplified guide to help you get started. For the full guide, refer to the [official Microsoft documentation](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).

### Register an application in Microsoft Entra

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com).
2. Navigate to **Identity** > **Applications** > **App registrations**.
3. Click **New registration**.
4. Enter a name for your application (for example, `Camunda Email Connector`).
5. Select **Accounts in this organizational directory only** for supported account types.
6. Click **Register**.

### Configure API permissions

1. In your registered application, navigate to **API permissions**.
2. Click **Add a permission**.
3. Select **Microsoft Graph** > **Application permissions**.
4. Search for and add the following permissions:
   - `Mail.Read` - Required for reading emails.
   - `Mail.ReadWrite` - Required for operations like mark as read, move, or delete emails.
5. Click **Add permissions**.
6. Click **Grant admin consent** for your organization. This requires administrator privileges.

**Warning**
The **Grant admin consent** step is critical. Without admin consent, the application cannot access mailbox data.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
