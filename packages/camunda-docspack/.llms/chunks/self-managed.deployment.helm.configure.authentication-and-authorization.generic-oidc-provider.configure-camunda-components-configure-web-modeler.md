# Connect Camunda to any OIDC provider — Configure Camunda components — Configure Web Modeler

Web Modeler requires two OIDC clients: one for the UI (public) and one for the API (confidential).

**Note**
If your IdP provides user-friendly names in the `name` claim, and you want Web Modeler to use that claim, configure the Web Modeler `restapi` environment variable `CAMUNDA_IDENTITY_USERNAMECLAIM=name`. Without this override, Helm defaults typically resolve usernames from `preferred_username`.

```yaml
global:
  identity:
    auth:
      webModeler:
        clientId: <web-modeler-ui-client-id>
        redirectUrl: <web-modeler-base-url>
        clientApiAudience: <web-modeler-ui-audience>
        publicApiAudience: <web-modeler-api-audience>

camundaHub:
  enabled: true # Deploys both Console and Web Modeler
  restapi:
    mail:
      fromAddress: noreply@example.com # Update with your email address
      # Additional SMTP configuration may be required - see Web Modeler docs
    externalDatabase:
      host: pg-hub-rw
      port: 5432
      database: hub
      username: hub
      secret:
        existingSecret: pg-hub-secret
        existingSecretKey: password
```

#### Web Modeler parameters

| Parameter           | Description                              | Value                                                                                             |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `clientId`          | Web Modeler UI client ID (public client) | From your provider                                                                                |
| `redirectUrl`       | Full URL for Web Modeler                 | `http://localhost:8070` (local) or `https://your-domain.com/modeler` (Ingress)                    |
| `clientApiAudience` | Audience for UI-to-API communication     | A unique value for the Web Modeler client API. Must differ from every other component's audience. |
| `publicApiAudience` | Audience for external API access         | The API client ID or custom audience                                                              |

#### Email configuration

Web Modeler requires email configuration for notifications. Update `restapi.mail.fromAddress` with an appropriate sender address.

For full SMTP configuration, see [Web Modeler configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
