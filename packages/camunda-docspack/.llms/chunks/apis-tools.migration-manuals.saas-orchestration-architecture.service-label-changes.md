# SaaS orchestration architecture — Service label changes

Breaking change

Due to the streamlined orchestration architecture introduced in 8.9, metrics previously emitted by the individual Operate, Tasklist, and Identity services are now emitted by the unified orchestration service. As a result, the `service` label on affected metrics will change to reflect the new source service.

This applies to Camunda 8 SaaS clusters using the [Cluster Metrics endpoint](https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/set-up-cluster-metrics-endpoint).

### Impact

Monitoring dashboards, alerting rules, or queries that filter or group by the `service` label on Orchestration Cluster metrics may stop matching expected values after upgrading to 8.9, as some metrics will now be emitted by a different source service.

### Action required

After your cluster is upgraded to 8.9, review your dashboards and alerting rules and verify which `service` label values your metrics return. Update any Prometheus queries or alert definitions that no longer match.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/saas-orchestration-architecture
