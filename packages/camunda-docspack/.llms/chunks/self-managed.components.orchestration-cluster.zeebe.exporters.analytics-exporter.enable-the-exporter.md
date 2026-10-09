# Analytics Exporter — Enable the exporter

Add an `analytics` exporter to your broker configuration. To disable it again, remove the declaration and restart the brokers.

```yaml
camunda:
  data:
    exporters:
      analytics:
        class-name: io.camunda.exporter.analytics.AnalyticsExporter
        args:
          categories:
            - contractual
            - optional
```

These are the equivalent environment variables:

```sh
CAMUNDA_DATA_EXPORTERS_ANALYTICS_CLASSNAME=io.camunda.exporter.analytics.AnalyticsExporter
CAMUNDA_DATA_EXPORTERS_ANALYTICS_ARGS_CATEGORIES_0=contractual
CAMUNDA_DATA_EXPORTERS_ANALYTICS_ARGS_CATEGORIES_1=optional
```

No further setup is required. The exporter resolves your [cluster ID](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#cluster) and [license key](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#licensing) from the broker automatically.

### Network requirements

The exporter makes outbound HTTPS requests to `telemetry.camunda.io`, the Camunda analytics endpoint. Allowlist this host in your egress firewall rules on every broker.

**Warning**
If the endpoint is unreachable, the exporter fails **silently**. No incident is raised, no error is surfaced to operators, and the brokers continue running normally. You will not be told if the exporter stops reaching the endpoint.

### Authentication

The exporter authenticates using your Camunda 8 Self-Managed license key.

There is nothing extra to configure. The exporter derives everything it needs from the license key already set on the cluster, and computes the credentials itself on startup.

**The raw license key is never transmitted.** The exporter sends a SHA-256 fingerprint of the key in the `x-camunda-fingerprint` header, and uses the key as an HMAC secret to sign each batch. Camunda maps the fingerprint to your organization.

If you rotate your license key, the exporter picks up the new key the next time the broker starts.

### Verify the exporter is running

When the exporter starts on a partition leader, look for the following log line:

```
Analytics exporter configured: endpoint=<endpoint>, clusterId=<cluster-id>, partitionId=<partition-id>, exporterDigest=<digest>, activeCategories=<categories>
```

`activeCategories` shows which categories the exporter is sending. This line confirms the exporter loaded its configuration; it does not confirm that the endpoint is reachable.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
