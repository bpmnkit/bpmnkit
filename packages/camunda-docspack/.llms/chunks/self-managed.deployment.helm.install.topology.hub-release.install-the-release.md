# Install the Camunda Hub release — Install the release

```sh
helm install camunda camunda/camunda-platform \
  --version "$HUB_CHART_VERSION" \
  --namespace hub \
  --create-namespace \
  --values hub-values.yaml
```

Confirm the Hub and Management Identity pods are ready, and that you can sign in to Camunda Hub, before you install an Orchestration Cluster release.


## Next steps

- [Install an Orchestration Cluster release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release)
- [Camunda Hub configuration properties](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release
