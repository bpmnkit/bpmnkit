# Job dashboard

Use the job dashboard in Camunda Hub to see active job types, track created, completed and failed jobs, spot trends over time, and drill into job worker errors.

Use the job dashboard to see which job types are active, how many jobs are created, completed, and failed, and which job workers are involved.


## Availability and permissions

The job dashboard is available for clusters running Camunda 8.9+.

For Software as a Service (SaaS):

- Available for clusters running Camunda 8.9+.
- Camunda manages the underlying job metrics configuration for you.
- If the **Jobs** card is missing or shows **Access restricted**, check that your user has permission to view job metrics in Camunda Hub. If the issue persists, contact your organization owner or Camunda Support.

For Self-Managed:

- Requires Camunda 8.9+ (Zeebe and Camunda Hub).
- Configure job metrics in the engine configuration (`camunda.monitoring.metrics.job-metrics.*`). These options and their default values are available in the auto-generated `defaults.yaml` file and the Helm values.
- If the **Jobs** card is missing or shows **Access restricted**, verify that:
  - The cluster is running Camunda 8.9+.
  - Job metrics are enabled in the engine configuration.
  - Camunda Hub can connect to the cluster.
  - Your user has permission to view job metrics.

**Info**
Camunda Hub is introduced in 8.10. If you're using 8.9, refer to [that version's documentation, which uses Camunda 8 Console](https://docs.camunda.io/docs/next/versioned_docs/version-8.9/components/console/job-dashboard/job-dashboard).

Access control:

- The global `READ_JOB_METRICS` permission is the only Camunda Hub permission required to use the job dashboard.
- Operate permissions are still required to view underlying instances when you click **View errors**.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/job-dashboard
