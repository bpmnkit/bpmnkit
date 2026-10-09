# Install an Optimize release — Install the release

```sh
helm install camunda-optimize-tenanta camunda/camunda-platform \
  --version "$HUB_CHART_VERSION" \
  --namespace orchestration \
  --values optimize-values.yaml
```

Use a distinct release name per tenant. Place Optimize releases in the Orchestration Cluster namespace, or in their own namespace. Either way, the release needs its own routing. See [route traffic to Optimize](#route-traffic-to-optimize).


## High availability

Optimize can run multiple replicas, but its importer and archiver must be active on only one replica at a time. Enabling them on more than one replica may cause data inconsistencies. See [Optimize system configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8#general-settings).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release
