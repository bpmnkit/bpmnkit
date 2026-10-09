# Understand Helm and application configuration responsibilities — Find the keys you still need to migrate

`helm install` and `helm upgrade` log a `[camunda][warning] DEPRECATION` message for every deprecated key you set to a non-default value. Each message names the key and where to configure it instead.

Treat that output as the authoritative list for your chart version. Camunda 8.10 is under active development and more keys may be deprecated across its release cycle, so any table in the documentation is a snapshot and the warnings are not.

```sh
helm upgrade camunda camunda/camunda-platform \
  --version "$ORCHESTRATION_CHART_VERSION" \
  --namespace camunda \
  -f values.yaml 2>&1 | grep 'DEPRECATION'
```

For the keys deprecated at the time of writing, and the tables mapping each one to its replacement, see [upgrade Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities
