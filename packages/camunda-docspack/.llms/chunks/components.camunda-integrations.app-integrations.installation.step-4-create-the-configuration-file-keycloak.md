# Install app integrations — Step 4: Create the configuration file — keycloak

Set `auth.kind` to `"keycloak"` for Keycloak-based Camunda Self-Managed installations.

| Field                             | Required | Description                                                                                                                            |
| :-------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.kind`                       | Yes      | Set to `keycloak`.                                                                                                                     |
| `auth.issuer`                     | Yes      | The Keycloak realm URL. For example, `https://<your-camunda-host>/auth/realms/camunda-platform`.                                       |
| `auth.audiences.zeebe`            | Yes      | The audience of the Orchestration Cluster API. Typically `camunda-platform`.                                                           |
| `auth.audiences.app_integrations` | No       | The audience App Integrations accepts on its own inbound API. Required if the exporter authenticates with OAuth instead of an API key. |
| `auth.m2m.clientId`               | Yes      | M2M client ID from [Step 1](#step-1-create-applications-in-camunda-identity).                                                          |
| `auth.m2m.clientSecret`           | Yes      | M2M client secret from [Step 1](#step-1-create-applications-in-camunda-identity).                                                      |
| `auth.spa.clientId`               | Yes      | SPA client ID from [Step 1](#step-1-create-applications-in-camunda-identity).                                                          |
| `auth.spa.clientSecret`           | Yes      | SPA client secret from [Step 1](#step-1-create-applications-in-camunda-identity).                                                      |

Example:

```yaml
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
```

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
