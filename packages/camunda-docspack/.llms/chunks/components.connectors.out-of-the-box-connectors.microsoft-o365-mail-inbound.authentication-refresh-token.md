# Microsoft 365 email inbound connector — Authentication — Refresh token

Select **Refresh token** in the **Type** dropdown in the **Authentication** section and provide the following fields:

- **Refresh Token**: Your refresh token value. Learn more about [how to get a refresh token](https://learn.microsoft.com/en-us/graph/auth-v2-user).
- **Tenant ID**: Your Microsoft Entra tenant ID (also called "Directory ID"). Learn more about [how to find a tenant ID](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-how-to-find-tenant).
- **Client ID**: The application ID that the [Azure app registration portal](https://go.microsoft.com/fwlink/?linkid=2083908) assigned to your app.
- **Client Secret** (optional): The client secret for your app. Required for confidential clients, not required for public clients.

**Note**
Refresh tokens expire after **90 days** by default. The connector cannot persist updated refresh tokens when stored as a secret or hardcoded value, so the originally configured token will expire regardless of usage. You must obtain and configure a new refresh token before the 90-day expiry.

See [Microsoft's documentation on refresh token lifetimes](https://learn.microsoft.com/en-us/entra/identity-platform/refresh-tokens#token-lifetime) for details.

**Note: Choosing an auth type for email polling**

- **Client credentials** (recommended): Uses Azure SDK's automatic token renewal. Best suited for long-running polling connectors.
- **Refresh token**: The connector re-exchanges the refresh token for a fresh access token on every poll cycle, ensuring continuous access. Suitable for delegated (user-context) scenarios.
- **Bearer token**: The client is created once with the provided token. Bearer tokens are short-lived (typically 1 hour) and **not recommended for polling connectors** — the token will expire and the connector will stop working.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
