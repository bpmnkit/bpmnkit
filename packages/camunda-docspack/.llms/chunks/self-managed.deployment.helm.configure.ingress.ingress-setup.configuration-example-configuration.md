# Configure the Helm chart with Ingress — Configuration — Example configuration

```yaml
# Chart values for the Camunda 8 Helm chart in combined Ingress setup.

# This file deliberately contains only the values that differ from the defaults.
# For changes and documentation, use your favorite diff tool to compare it with:
# https://artifacthub.io/packages/helm/camunda/camunda-platform

# IMPORTANT: Make sure to change "camunda.example.com" to your domain.

global:
  host: "camunda.example.com"
  ingress:
    enabled: true
    className: nginx
  identity:
    auth:
      publicIssuerUrl: "https://camunda.example.com/auth/realms/camunda-platform"
      optimize:
        redirectUrl: "https://camunda.example.com/optimize"
      webModeler:
        redirectUrl: "https://camunda.example.com/modeler"
      console:
        redirectUrl: "https://camunda.example.com/console"

identity:
  contextPath: "/identity"
  fullURL: "https://camunda.example.com/identity"

optimize:
  contextPath: "/optimize"

orchestration:
  contextPath: "/orchestration"
  ingress:
    grpc:
      enabled: true
      className: nginx
      host: "zeebe.camunda.example.com"

webModeler:
  # The context path is used for the web application that will be accessed by users in the browser.
  # In addition, a WebSocket endpoint will be exposed on "[contextPath]-ws", e.g. "/modeler-ws".
  contextPath: "/modeler"

console:
  contextPath: "/console"

connectors:
  contextPath: "/connectors"
```

Incorporate these custom values into the values file you use to deploy Camunda (see [Install Camunda with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install)):

```shell
helm install camunda camunda/camunda-platform --version $HELM_CHART_VERSION -f values-combined-ingress.yaml
```

After deployment, access the Camunda 8 components at:

- **Management Applications:** `https://camunda.example.com/[identity|modeler|console]`
- **Core Orchestration Applications and REST API:** `https://camunda.example.com/orchestration/[identity|operate|optimize|tasklist|v2]`
- **Web Modeler WebSocket:** Web Modeler exposes a WebSocket endpoint on `https://camunda.example.com/modeler-ws`. This is only used internally by the application and not for direct user access.
- **Keycloak authentication:** `https://camunda.example.com/auth`
- **Zeebe gRPC Gateway:** `grpc://zeebe.camunda.example.com`

**Note**
This configuration shows only the Ingress-related values for `webModeler`and `Console`. For full setup, see [Enable additional components](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/enable-additional-components).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
