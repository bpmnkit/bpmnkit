# Set up the Cluster Metrics endpoint — Enable Cluster Metrics endpoint

Enable the Cluster Metrics endpoint per Orchestration cluster via either Camunda Hub or the API. When the endpoint is enabled, Camunda provisions a secure, cluster-scoped metrics endpoint for external scraping.

To activate the endpoint:

1. Sign in to Camunda Hub.
1. In the left navigation, click **Environments**, and then click **Clusters**.
1. Select an existing cluster, or create a new one.
1. Open the **Monitoring** tab for the cluster.
1. Click **Activate monitoring endpoint**.
1. Enter a **username** for the monitoring credentials.
1. Click **Activate**.

### Capture connection details

When the Cluster Metrics endpoint is activated, Camunda Hub displays a dialog containing the authentication credentials.

1. Copy and store the password securely.
1. Click **Got it** to close the dialog.

After closing the dialog, you can find the metrics endpoint URL in the **Monitoring** tab for the cluster.

**Warning**
Copy and safely store the password when it is displayed. The password is not shown again after you close the dialog. If you lose it, generate a new password.

The following information is required to connect your monitoring system:

- **Metrics endpoint URL**: HTTPS endpoint used by your monitoring system to scrape metrics.
- **Username**: Used for Basic authentication.
- **Password**: Used for Basic authentication.

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/set-up-cluster-metrics-endpoint
