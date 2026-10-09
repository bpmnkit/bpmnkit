# Set up the Helm chart with an in-cluster Keycloak instance — Configuration — Configure components using OIDC

Once Management Identity is configured, you can set up OAuth and OIDC for the remaining components. You can skip components you don’t plan to run. By default, the Orchestration Cluster and Connectors are enabled and must be explicitly disabled if not required.

#### Configure Orchestration Cluster

The Orchestration cluster treats the in-cluster Keycloak as any other external IdP and connects through OIDC.

Orchestration Cluster configuration:

```yaml
orchestration:
  security:
    authentication:
      oidc:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-orchestration-client-token"
```

#### Configure Connectors

Connectors must be configured in a similar fashion with OIDC client secret to access the Orchestration Cluster APIs.

Connectors component configuration:

```yaml
connectors:
  security:
    authentication:
      oidc:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-connectors-client-token"
```

#### Configure Optimize

Optimize component configuration:

```yaml
global:
  identity:
    auth:
      optimize:
        secret:
          existingSecret: "camunda-credentials"
          existingSecretKey: "identity-optimize-client-token"

optimize:
  enabled: true
```

Add the section under `global.identity.auth` to the existing section you created when configuring Management Identity.

#### Configure Web Modeler and Console (Camunda Hub)

In Camunda 8.10, Console and Web Modeler are deployed together as sub-components of **Camunda Hub**. Enable both by setting `camundaHub.enabled: true`. This replaces the former `console.enabled` and `webModeler.enabled` flags and takes precedence over them.

Web Modeler connects to its own PostgreSQL database and requires a redirect URL for OIDC authentication. Console is a public client and needs no additional OIDC configuration.

Web Modeler component configuration:

```yaml
global:
  identity:
    auth:
      webModeler:
        redirectUrl: "http://localhost:8070" # Change this when using a domain

camundaHub:
  enabled: true # Deploys both Console and Web Modeler
  restapi:
    mail:
      fromAddress: noreply@example.com
    # Connect Camunda Hub to the operator-managed PostgreSQL cluster (pg-hub)
    externalDatabase:
      host: pg-hub-rw
      port: 5432
      database: hub
      username: hub
      secret:
        existingSecret: pg-hub-secret
        existingSecretKey: password
```

**Important: Redirect URL configuration**
The `redirectUrl` parameter is **required** for Web Modeler authentication. The default value is `http://localhost:8070`, which works for local port-forwarding setups.

If you're using a domain or Ingress to expose Web Modeler, you **must** update this value to match your Web Modeler URL:

- With Ingress: `https://your-domain.com/modeler` (if using a context path)
- Without context path: `https://modeler.your-domain.com`

Mismatched redirect URLs will cause authentication failures that are difficult to debug.

You can update `camundaHub.restapi.mail.fromAddress` with an address suitable for your environment.
This address appears as the sender in emails sent by Web Modeler.
For more details on configuring email delivery, see the [Camunda Hub section in Enable additional Camunda components](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/enable-additional-components#camunda-hub).

#### Configure Console

Console is deployed as part of Camunda Hub, which you enabled with `camundaHub.enabled: true` in the [previous step](#configure-web-modeler-and-console-camunda-hub). Since Console is a public client, it does not need to be defined under `global.identity.auth` and requires no additional configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
