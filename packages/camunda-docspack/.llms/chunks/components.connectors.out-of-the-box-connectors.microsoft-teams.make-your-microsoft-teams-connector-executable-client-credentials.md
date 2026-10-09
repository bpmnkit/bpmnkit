# Microsoft Teams connector — Make your Microsoft Teams connector executable — Client credentials

Select **Client credentials** in the **Type** dropdown in the **Authentication** section and provide the following fields:

- **Tenant ID**: Your Microsoft Entra tenant ID (also called "Directory ID"). Learn more about [how to find a tenant ID](https://learn.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-how-to-find-tenant).
- **Client ID**: The application ID that the [Azure app registration portal](https://go.microsoft.com/fwlink/?linkid=2083908) assigned to your app.
- **Client Secret**: The client secret you created in the app registration portal for your app.

#### Create a client secret

1. In the [Azure app registration portal](https://go.microsoft.com/fwlink/?linkid=2083908), navigate to your registered application.
2. Go to **Certificates & secrets**.
3. Click **New client secret**.
4. Enter a description (for example, `Camunda Connector Secret`).
5. Select an expiration period. You will need to rotate the secret before it expires.
6. Click **Add**.
7. Copy the secret value immediately. This value is only displayed once and cannot be retrieved later.

Store your credentials securely using [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-teams
