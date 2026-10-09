# Set up the Helm chart with an external Keycloak instance — Configure the Helm chart — Configure Management Identity

Configure Management Identity to access the realm and use the initial OIDC client.
On startup, Management Identity creates the realm (if needed), sets up the OIDC clients, and creates the initial user account.

If no clients appear in the Keycloak realm after startup, the configuration was not successful.

Management Identity configuration:

```yaml
global:
  identity:
    keycloak:
      url: # this URL must be reachable from within the cluster
        protocol: <keycloak_protocol>
        host: <keycloak_hostname>
        port: <keycloak_port>
      contextPath: <keycloak_context_path> # set to "/" for the root context path
      realm: /realms/<realm>
      auth:
        adminUser: <keycloak_admin>
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-keycloak-admin-password"
    auth:
      identity:
        clientId: <identity_client_id>

identity:
  enabled: true
  firstUser:
    secret:
      existingSecret: "camunda-credentials"
      existingSecretKey: "identity-firstuser-password"
  externalDatabase:
    enabled: true
    host: pg-identity-rw
    port: 5432
    database: identity
    username: identity
    secret:
      existingSecret: pg-identity-secret
      existingSecretKey: password
  env:
    - name: KEYCLOAK_REALM
      value: <realm>
    - name: IDENTITY_CLIENT_ID
      value: <identity_client_id>
```

Add the section under `global.identity` to the `global` configuration you created in the previous step.

Management Identity stores its data in a dedicated PostgreSQL database. Connect it to the `pg-identity` cluster created by the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment), or to a managed database. Chart `15.x` no longer bundles the `identityPostgresql` subchart, so this connection has to be configured explicitly.

**Note**
Chart 15.x (Camunda 8.10) rejects the flat `global.identity.keycloak.auth.existingSecret` and `auth.existingSecretKey` form used by earlier charts. Use the nested `auth.secret.*` form shown above. In charts 14.x (Camunda 8.8 and 8.9) the flat form still works but logs a deprecation warning. For the full list of values removed in 8.10, see [Remove keys rejected by chart 15.x](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#remove-keys-rejected-by-chart-15x).
The `identity.firstUser` field defines the initial user that Management Identity creates in Keycloak with full access to all Camunda components.
By default, this user is named `demo`. To use a different name, set `identity.firstUser.username`.

For additional Keycloak-specific variables you can define under `identity.env`, see [Management Identity environment variables](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
