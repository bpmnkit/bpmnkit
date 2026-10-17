# Install app integrations — Step 4: Create the configuration file — Example configuration file

Replace the placeholder values with your actual settings. `teams` and `slack` are both optional blocks; include only the ones for the platforms you registered in [Step 2](#step-2-register-the-chat-app), and delete the other.

- Use the credentials from [Step 1](#step-1-create-applications-in-camunda-identity), the Teams configuration from [Step 2](#step-2-register-the-chat-app), and the Slack `command` value you chose there.
- The `exporter.apiKey` must match the API key configured in the Orchestration Cluster Helm chart in [Step 3](#step-3-configure-the-app-integrations-exporter).
- For production deployments, replace sensitive values with environment variable references as described in [Secret management](#secret-management).
- See [Auth configuration](#auth-configuration) for the full `auth` block reference.

```yaml
serverPort: 8080
stage: prod

# See "Auth configuration" above for Keycloak and Entra variants.
auth:
  kind: keycloak
  m2m:
    clientId: <your-m2m-client-id>
    clientSecret: <your-m2m-client-secret>
  spa:
    clientId: <your-spa-client-id>
    clientSecret: <your-spa-client-secret>
  issuer: https://<your-camunda-host>/auth/realms/camunda-platform
  audiences:
    zeebe: camunda-platform

db:
  username: <your-postgres-username>
  password: <your-postgres-password>
  database: <your-database-name>
  host: <your-postgres-host>
  loginType: password
  encryptionKey: "<your-32-character-encryption-key>"

# Include this block only if you registered Microsoft Teams in Step 2.
# Paste the output of `c8-teams show-config` here:
teams:
  clientId: <your-azure-ad-client-id>
  appId: <your-teams-app-id>
  appPassword: <your-azure-ad-app-password>
  tenantId: <your-azure-ad-tenant-id>
  tabEndpoint: https://<your-public-url>/ms-teams-app

# Include this block only if you registered Slack in Step 2.
slack:
  botToken: <your-slack-bot-token>
  signingSecret: <your-slack-signing-secret>
  command: /camunda

session:
  secure: true
  secret: <your-random-session-secret>

frontendUrl: https://<your-public-url>
backendUrl: https://<your-public-url>

flavor: self-managed

organisation:
  name: <your-organization-name>

clusters:
  - uuid: <unique-cluster-uuid>
    name: <cluster-display-name>
    urls:
      orchestration: https://<your-camunda-host>/orchestration
      tasklist: https://<your-camunda-host>/tasklist
      # Extended format (object with base and task):
      # tasklist:
      #   base: https://<your-camunda-host>/tasklist
      #   task: https://<your-camunda-host>/tasklist/tasks/:userTaskKey/view
      operate: https://<your-camunda-host>/operate
    exporter:
      apiKey: <your-exporter-api-key>

subscriptions: {}
```

**Note**
The `urls.tasklist` field supports two formats:

- **Simple (legacy) format**: a plain URL string (for example, `https://<your-camunda-host>/tasklist`). Deep links to tasks fall back to `{tasklist-url}/tasklist/{userTaskKey}`.
- **Extended format**: an object with `base` and `task` fields. The `task` field is a URL template containing a `:userTaskKey` placeholder (for example, `https://<your-camunda-host>/tasklist/tasks/:userTaskKey/view`). When the app generates deep links to tasks (for example, in a notification card), it replaces `:userTaskKey` with the actual task key. This allows customization of the task URL pattern for environments where the default path does not match.

**Note**
On Camunda 8.10, a cluster can host several [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index). To serve them from one App Integrations deployment, add a `physicalTenants` array to the cluster. See [App Integrations and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations).

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
