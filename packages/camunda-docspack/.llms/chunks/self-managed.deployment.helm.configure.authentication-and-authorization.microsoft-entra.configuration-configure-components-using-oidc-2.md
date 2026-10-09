# Set up the Helm chart with an external Microsoft Entra tenant — Configuration — Configure components using OIDC (2)

#### Configure Management Identity

Add the following configuration for Management Identity:

```yaml
global:
  identity:
    auth:
      identity:
        clientId: "<mgmt-identity-app-id>"
        audience: "<mgmt-identity-app-id>"
        initialClaimName: preferred_username
        initialClaimValue: "<the email address of your initial admin user>"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "identity-client-secret"

identity:
  enabled: true
  externalDatabase:
    enabled: true
    host: pg-identity-rw
    port: 5432
    database: identity
    username: identity
    secret:
      existingSecret: pg-identity-secret
      existingSecretKey: password
```

Replace `<IDENTITY_URL>` with the base URL of Management Identity as it will be reachable from your users' browser. For local deployment, use `http://localhost:8084`.

Management Identity requires an externally managed PostgreSQL database. Provision the database before deploying, and adapt the connection values and secret references to your setup. For the full parameter list, see [Use external PostgreSQL](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres).

- `initialClaimName` defines which claim in the access token identifies the initial administrative user.
- `initialClaimValue` defines the value of that claim that grants administrative access to Management Identity.

Choose the claim based on whether you value readability or stability:

| Claim                | Trade-off                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `preferred_username` | The user's UPN. Readable and self-documenting, which makes it easy to work with during initial setup. Requires the optional claim to be added. |
| `oid`                | The user's Entra Object ID. Always present without optional claim configuration, and unchanged if the user's email address changes.            |

Because `initialClaimValue` is applied only on first startup and can't be updated through Helm afterward, `oid` is the more stable choice for production.

**Danger**
Once configured, the initial claim name and value cannot be changed using environment variables or Helm values.
To update them, modify the Identity PostgreSQL database directly.

**Tip**
If Optimize is not enabled, add the following environment variable to ensure Management Identity starts successfully:

```
identity:
  env:
    - name: CAMUNDA_IDENTITY_AUDIENCE
      value: "<mgmt-identity-app-id>"
```

#### Configure Optimize

Add the following configuration for Optimize:

```yaml
global:
  identity:
    auth:
      optimize:
        clientId: "<optimize-app-id>"
        audience: "<optimize-app-id>"
        redirectUrl: "<OPTIMIZE_URL>"
        secret:
          existingSecret: "entra-credentials"
          existingSecretKey: "optimize-client-secret"

optimize:
  enabled: true
```

Replace `<OPTIMIZE_URL>` with the base URL of Optimize as it will be reachable from your users' browser. For local deployment, use `http://localhost:8083`.

#### Configure Web Modeler

Add the following configuration for Web Modeler:

**Note**
If you want Web Modeler to resolve usernames from the `name` claim instead of `preferred_username`, add `CAMUNDA_IDENTITY_USERNAMECLAIM=name` to the Web Modeler `restapi` environment configuration.

```yaml
global:
  identity:
    auth:
      webModeler:
        clientId: "<web-modeler-ui-app-id>"
        clientApiAudience: "<web-modeler-ui-app-id>"
        publicApiAudience: "<web-modeler-api-app-id>"
        redirectUrl: "<WEB_MODELER_URL>"

camundaHub:
  enabled: true # Deploys both Console and Web Modeler
  restapi:
    mail:
      fromAddress: noreply@example.com
    externalDatabase:
      host: pg-hub-rw
      port: 5432
      database: hub
      username: hub
      secret:
        existingSecret: pg-hub-secret
        existingSecretKey: password
```

Replace `<WEB_MODELER_URL>` with the base URL of Web Modeler as it will be reachable from your users' browser. For local deployment, use `http://localhost:8070`.

Web Modeler requires an externally managed PostgreSQL database, configured under `camundaHub.restapi.externalDatabase`. Provision the database before deploying. For the full parameter list, see [Use external PostgreSQL](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres).

You can update `camundaHub.restapi.mail.fromAddress` with an address suitable for your environment.
This address appears as the sender in emails sent by Web Modeler.
For more details on configuring email delivery, see the [Camunda Hub section in Enable additional Camunda components](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/enable-additional-components#camunda-hub).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
