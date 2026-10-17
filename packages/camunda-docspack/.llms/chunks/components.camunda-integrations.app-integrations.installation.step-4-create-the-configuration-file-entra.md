# Install app integrations — Step 4: Create the configuration file — entra

Set `auth.kind` to `"entra"` for Microsoft Entra ID (formerly Azure AD) based setups.

| Field                             | Required | Description                                                                                                                            |
| :-------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.kind`                       | Yes      | Set to `entra`.                                                                                                                        |
| `auth.issuer`                     | No       | Derived automatically as `https://login.microsoftonline.com/<tenantId>/v2.0`. Override only if using a custom authority.               |
| `auth.audiences.zeebe`            | Yes      | The audience of the Orchestration Cluster API. In Entra setups this is usually the Application ID URI of the M2M app registration.     |
| `auth.audiences.app_integrations` | No       | The audience App Integrations accepts on its own inbound API. Required if the exporter authenticates with OAuth instead of an API key. |
| `auth.m2m.clientId`               | Yes      | Entra App Registration client ID for the M2M application.                                                                              |
| `auth.m2m.clientSecret`           | Yes      | Entra App Registration client secret for the M2M application.                                                                          |
| `auth.spa.clientId`               | Yes      | Entra App Registration client ID for the SPA application.                                                                              |
| `auth.spa.clientSecret`           | Yes      | Entra App Registration client secret for the SPA application.                                                                          |
| `auth.entra.tenantId`             | Yes      | The Entra tenant ID.                                                                                                                   |
| `auth.entra.tokenUrl`             | No       | Defaults to `https://login.microsoftonline.com/<tenantId>/oauth2/v2.0/token`.                                                          |
| `auth.entra.jwksUrl`              | No       | Defaults to `https://login.microsoftonline.com/<tenantId>/discovery/v2.0/keys`.                                                        |
| `auth.entra.scope`                | No       | Defaults to `openid profile offline_access <auth.audiences.zeebe>/.default`.                                                           |
| `auth.entra.usernameClaim`        | No       | The ID token claim used to resolve the user's email. Default: `preferred_username`.                                                    |

Example:

```yaml
auth:
  kind: entra
  m2m:
    clientId: <your-entra-m2m-client-id>
    clientSecret: <your-entra-m2m-client-secret>
  spa:
    clientId: <your-entra-spa-client-id>
    clientSecret: <your-entra-spa-client-secret>
  audiences:
    zeebe: <your-orchestration-cluster-audience>
  entra:
    tenantId: <your-entra-tenant-id>
```

**Note**
Most parameters in the `auth.entra` block are automatically inferred from the required `tenantId` parameter. You only need to override them if your environment uses non-standard Entra endpoints.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
