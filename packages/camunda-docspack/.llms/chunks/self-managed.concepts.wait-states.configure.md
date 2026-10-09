# Configure wait state tracking

Configure wait state tracking in Camunda 8 Self-Managed.

Configure [wait state tracking](https://docs.camunda.io/docs/next/components/wait-states/overview) in Camunda 8 Self-Managed.


## Enable or disable wait state tracking

Wait state tracking is enabled by default. You can disable it if you do not want to track this data.

To change the default behavior in Camunda 8 Self-Managed, configure your deployment:

### application.yaml

```yaml
camunda:
  data:
    wait-states:
      enabled: true # Wait state tracking is enabled by default
```

### env

```bash
CAMUNDA_DATA_WAITSTATES_ENABLED=true
```

### helm

```yaml
orchestration:
  extraConfiguration:
    - file: additional-spring-properties.yaml
      content: |
        camunda:
          data:
            wait-states:
              enabled: true # Wait state tracking is enabled by default
```

See [all configuration options](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundadatawait-states) to learn more.

Disabling wait state tracking stops new wait states from being tracked. It doesn't purge existing wait state data immediately. The secondary storage retention settings clean up that data over time. Until the data is cleaned up, you can continue to access it in [Operate](https://docs.camunda.io/docs/next/components/operate/userguide/view-wait-states) and the [Search API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-element-instance-wait-states.api).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/wait-states/configure
