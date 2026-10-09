# Configure component configuration — Connectors configuration

**Info**
Connectors are **enabled by default** in Camunda 8.8. This section covers configuration options for Connectors, including how to disable them if needed.

The Connector runtime is enabled by default. To use connectors, install connector element templates. For details, see [Manage connector templates in Web Modeler](https://docs.camunda.io/docs/next/components/connectors/manage-connector-templates) or [Configuring templates in Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates).

For the full list of options, see the [Connectors Helm values](https://artifacthub.io/packages/helm/camunda/camunda-platform#connectors-parameters).

### Disable Connectors

To disable Connectors, set `connectors.enabled: false` when deploying the Helm chart:

```yaml
connectors:
  enabled: false
```

### Polling authentication mode

Connectors use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) to fetch process definitions that contain inbound connectors. Depending on your Camunda architecture, choose one of the following values for the `inbound.mode` parameter:

- `disabled` — Polling from the Orchestration Cluster is disabled. The connector runtime supports only outbound interactions, such as HTTP REST calls.
- `credentials` — The connector runtime authenticates to the Orchestration Cluster REST API with basic HTTP authentication.
- `oauth` — _(Recommended, and enabled by default)_ The connector runtime authenticates to the Orchestration Cluster REST API with OAuth 2.0. Camunda uses Keycloak as the default OAuth provider.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
