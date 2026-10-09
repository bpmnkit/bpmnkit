# Set up the Cluster Metrics endpoint — Disable the Cluster Metrics endpoint

If you no longer want to expose cluster metrics externally, you can disable the Cluster Metrics endpoint:

- Click **Deactivate** in the **Monitoring** tab, or
- Delete all credentials associated with the endpoint

When the Cluster Metrics endpoint is disabled:

- The monitoring endpoint is shut down almost immediately (typically within a few seconds).
- All existing credentials are deleted and are not retained if the endpoint is reactivated.
- Monitoring systems can no longer scrape metrics from the cluster.

To use the endpoint again, you must reactivate it and create new credentials. Disabling the Cluster Metrics endpoint does not affect cluster operation or workload execution.

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/set-up-cluster-metrics-endpoint
