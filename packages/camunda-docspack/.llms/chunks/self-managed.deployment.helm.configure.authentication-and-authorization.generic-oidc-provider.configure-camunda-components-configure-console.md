# Connect Camunda to any OIDC provider — Configure Camunda components — Configure Console

Add configuration for Console:

```yaml
global:
  identity:
    auth:
      console:
        clientId: <console-client-id>
        audience: <console-audience>
        redirectUrl: <console-base-url>
```

Console is deployed as part of Camunda Hub, which you enable with `camundaHub.enabled: true` in the [Web Modeler step](#configure-web-modeler). Replace `<console-base-url>` with the base URL where Console will be accessible. For local deployment, use `http://localhost:8087`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
