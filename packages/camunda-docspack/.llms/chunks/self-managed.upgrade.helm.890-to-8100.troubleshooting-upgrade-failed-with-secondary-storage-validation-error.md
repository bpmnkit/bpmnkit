# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Upgrade failed with secondary storage validation error

If Helm fails with a validation error about the secondary storage type, set the type explicitly:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch # or "opensearch" or "rdbms"
```

Then set the connection settings for that backend, for example `orchestration.data.secondaryStorage.elasticsearch.url`. The Elasticsearch default uses `<RELEASE>-elasticsearch`, which chart 15.x doesn't deploy.

Alternatively, if you don't need secondary storage, set `global.noSecondaryStorage: true`. This setting disables Operate, Tasklist, and Optimize.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
