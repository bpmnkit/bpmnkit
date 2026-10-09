# Set up the Cluster Metrics endpoint — Manage authentication credentials

Authentication credentials are created and managed in Camunda Hub.

### Create additional credentials

You can create up to 20 credentials per cluster.

To create additional credentials:

1. On the **Monitoring** tab, click **Create new credentials**.
1. Enter a username.
1. Generate and copy the password when it is displayed.

### Rotate credentials

Ƭo rotate a password:

1. On the **Monitoring** tab, locate the credential.
1. Click the **Generate password** icon next to the username.
1. Generate and copy the new password when prompted.

When credentials are removed or rotated, previously issued credentials may continue to work briefly. Access may persist for up to five minutes before the credentials are fully invalidated.

To avoid interruptions during credential rotation, you can create multiple credentials for the same cluster and update your monitoring system to switch between credentials, rather than rotating a single credential in place.

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/set-up-cluster-metrics-endpoint
