# Microsoft Teams connector — Make your Microsoft Teams connector executable — Refresh token

Select **Refresh token** in the **Type** dropdown in the **Authentication** section and provide the following fields:

- **Refresh Token**: Your refresh token value. Learn more about [how to get a refresh token](https://learn.microsoft.com/en-us/graph/auth-v2-user).
- **Tenant ID**: Your Microsoft Entra tenant ID (also called "Directory ID"). Learn more about [how to find a tenant ID](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-how-to-find-tenant).
- **Client ID**: The application ID that the [Azure app registration portal](https://go.microsoft.com/fwlink/?linkid=2083908) assigned to your app.
- **Client Secret** (optional): The client secret for your app. Required for confidential clients, not required for public clients.

**Note**
Refresh tokens expire after **90 days** by default. The connector cannot persist updated refresh tokens when stored as a secret or hardcoded value, so the originally configured token will expire regardless of usage. You must obtain and configure a new refresh token before the 90-day expiry.

See [Microsoft's documentation on refresh token lifetimes](https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens#token-lifetime) for details.

**Note**
With **Client credentials** type authentication, some methods of the **Microsoft Teams connector** may not be available. Find more details in the [chat methods table](#chat-methods) and [channel methods table](#channel-methods).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-teams
