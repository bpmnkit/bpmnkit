# Enable additional Camunda components — Optimize

Optimize is disabled by default in the Camunda 8 Helm chart. To enable it:

- Set `optimize.enabled: true` in a values file.
- **Enable Management Identity** (required for authentication) - see [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index).

```yaml
optimize:
  enabled: true
```

For a full list of options, see the [Optimize Helm values](https://artifacthub.io/packages/helm/camunda/camunda-platform#optimize-parameters).

**Note**
Disabling Optimize removes the legacy Elasticsearch/OpenSearch exporter from the broker's static configuration. However, it does not remove the exporter from the dynamic configuration, which prevents log compaction and increases disk usage. See [Disable an exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#disable-an-exporter) for the additional step required to fully disable it.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/enable-additional-components
