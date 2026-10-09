# Enable secure connectivity — Deactivate secure connectivity

In the **Private networking** tab, select **Deactivate service** to remove the VPC endpoint service for the cluster.

Public connectivity remains available.


## View-only access

If you do not have permission to manage private networking for a cluster:

- The **Activate PrivateLink endpoint service** button is not displayed.
- The **Deactivate service** option is not displayed.
- Edit options for **Allowed principals** and **Supported regions** are hidden.

You can still view the **Service details** and **Endpoint connections** sections.


## Limits

You can create up to 10 VPC endpoint connections per cluster.

For organization-wide limits and adjustments, see [secure connectivity (AWS PrivateLink)](https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index).

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/enable-secure-connectivity
