# Set up the Helm chart with an external Keycloak instance — Configure Keycloak

Before setting up the Camunda Helm chart, prepare your Keycloak instance.  
For the Keycloak realm, you have two options:

- [Use an existing realm](#option-1-prepare-an-existing-realm)
- [Let Management Identity create a realm](#option-2-let-management-identity-create-a-realm)

### Option 1: Prepare an existing realm

If you choose this option, configure your Keycloak realm following the [Management Identity configuration guide](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak).

Take note of the following values:

- Realm name (`<realm>`)
- Client ID for Management Identity (`<identity_client_id>`)
- Administrative Keycloak username and password (`<keycloak_admin_username>`, `<keycloak_admin_password>`)

### Option 2: Let Management Identity create a realm

If you choose this option, Management Identity will create a realm named `camunda-platform` on startup.  
Ensure this realm doesn’t already exist before starting for the first time.

Take note of the following values:

- Realm name: `camunda-platform` (`<realm>`)
- Client ID generated for setup: `camunda-identity` (`<identity_client_id>`)
- Administrative Keycloak username and password (`<keycloak_admin_username>`, `<keycloak_admin_password>`)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
