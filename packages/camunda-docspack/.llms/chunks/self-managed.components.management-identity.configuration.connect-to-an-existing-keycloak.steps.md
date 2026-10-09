# Connect to an existing Keycloak instance — Steps

**Caution: Keycloak URLs**
As of version 8.5.3, Management Identity uses the Keycloak frontend URL instead of the backend URL. This change may affect you if the frontend URL is blocked from other services (including Camunda applications) and could impact Management Identity functionality.

To avoid connectivity issues, ensure your Keycloak frontend URL is accessible by adjusting your network, firewall, or security settings as needed. This adjustment is crucial to maintain the integration with Keycloak and ensure compatibility.

To connect Management Identity to an existing Keycloak instance, take the following steps for your Camunda installation.

### Prepare an existing Keycloak realm

Management Identity can either create a Keycloak realm called `camunda-platform` with all settings from scratch, or it can use an already existing Keycloak realm. If you would like to use an existing Keycloak realm, prepare following the steps below. Otherwise you can skip this section.

1. Log in to your Keycloak Admin Console.
1. Select the realm you want to connect Management Identity to (for example, **camunda-platform**).  
   ![keycloak-admin-realm-select](../img/keycloak-admin-realm-select.png)
**Warning**
   Management Identity only supports Keycloak realms where the realm name and realm ID are the same value.  
   This is not the case for realms created through the Keycloak UI (where the ID becomes a generated value).  
   You can specify both name and ID when using [Keycloak's JSON import feature](https://www.keycloak.org/server/importExport).
1. In the navigation menu, select **Clients**, then click **Create**.
1. Enter a client ID and click **Next**.
**Note: What client ID should I use?**
   By default, Management Identity uses the client ID `camunda-identity`.  
   If you use a different ID, set it in the Management Identity application [environment variables](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables).
   ![keycloak-admin-client-add-1](../img/keycloak-admin-client-add-1.png)
1. Turn **Client authentication** on, select **Service accounts roles**, ensure **Authorization** is off, and click **Next**.
   ![keycloak-admin-client-add-2](../img/keycloak-admin-client-add-2.png)
1. In the **Root URL** field, enter the URL where your Management Identity instance will be hosted, then click **Save**.
   ![keycloak-admin-client-add-3](../img/keycloak-admin-client-add-3.png)
1. Open the created client, then select the **Service account roles** tab.
   ![keycloak-admin-client-update-1](../img/keycloak-admin-client-update-1.png)
1. Click **Assign role**, then change the filter to **Filter by clients**.
   ![keycloak-admin-client-update-2](../img/keycloak-admin-client-update-2.png)
1. Select the `manage-clients`, `manage-realm`, and `manage-users` roles, then click **Assign**.
**Note: Why does Management Identity need these roles?**
   Management Identity allows users to manage entities related to Camunda.  
   These roles provide the necessary access to the Keycloak realm.
1. Open the **Credentials** tab and copy the client secret.

### Configure and start the application

Configure Management Identity with the following environment variables:

1. `IDENTITY_CLIENT_ID`: The ID of the client you created (or `camunda-identity` if you let Management Identity create it automatically).
1. `KEYCLOAK_REALM`: The realm name you want to use (or `camunda-platform` if using the default).
1. `KEYCLOAK_SETUP_USER`: The username of an administrative Keycloak user.
1. `KEYCLOAK_SETUP_PASSWORD`: The password for the administrative user.

**Tip**
If you use a non-default realm, you need to set additional Keycloak-specific variables.  
See [environment variables](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables) for details.

Start the Management Identity application.

**Note: What does Management Identity create when starting?**
When starting, Management Identity creates a base configuration required for operation.  
See [starting configuration](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/starting-configuration) for details.

**Tip: Helm chart setup**
To run a full Camunda cluster with an existing Keycloak instance, see  
[Helm chart setup for existing Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak#create-a-secret).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak
