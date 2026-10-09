# Set up the Helm chart with an external Microsoft Entra tenant — Configuration — Configure components using OIDC (3)

#### Configure Console

Add the following configuration for Console:

```yaml
global:
  identity:
    auth:
      console:
        clientId: "<console-app-id>"
        audience: "<console-app-id>"
        redirectUrl: "http://localhost:8087"
```

Console is deployed by Camunda Hub, which you enabled in the [Configure Web Modeler](#configure-web-modeler) step; the configuration above only defines its OIDC client.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
