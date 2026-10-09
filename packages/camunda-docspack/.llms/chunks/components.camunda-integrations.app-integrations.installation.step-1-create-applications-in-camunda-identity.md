# Install app integrations — Step 1: Create applications in Camunda Identity

Before writing the configuration file, register two OAuth 2.0 applications in your identity provider.

1. Access the Identity management in your Camunda Self-Managed distribution.
2. Create the following two applications.

### App Integrations M2M (Machine-to-Machine)

| Field          | Value                        |
| :------------- | :--------------------------- |
| Type           | `m2m`                        |
| Access to APIs | Orchestration API (`read:*`) |

Note down the generated `clientId` and `clientSecret`. You will need them for `auth.m2m` in the configuration file.

### App Integrations SPA (Single Page Application)

| Field         | Value                         |
| :------------ | :---------------------------- |
| Type          | `Confidential`                |
| Redirect URIs | `https://<your-public-url>/*` |

Note down the generated `clientId` and `clientSecret`. You will need them for `auth.spa` in the configuration file.

### Grant offline access role

### keycloak

In your Keycloak admin console, ensure that users who will use the app integrations have the `offline_access` role assigned. This is required so the application can refresh tokens and act on behalf of users when sending proactive notifications.

You can assign `offline_access` at the realm level (**Realm Roles** → `offline_access`) or via a group/client scope, depending on your setup.

### entra

For Entra-based setups, offline/refresh token access is configured via the App Registration's API permissions in the Azure portal.

You must ensure the SPA App Registration has the `offline_access` permission granted under **API permissions** → **Microsoft Graph** → **Delegated permissions**.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
