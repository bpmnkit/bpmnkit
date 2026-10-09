# Configuration — Secret filter — Configure the mode in the Helm chart

The Helm chart has no dedicated value for the secret filter. Set the mode through the generic `connectors.env` value:

```yaml
connectors:
  env:
    - name: CAMUNDA_CONNECTOR_SECRETRESOLVER_SECRETFILTER_MODE
      value: LAX
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
