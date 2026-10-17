# Manage your connectors — Manage connectors

Manage connectors from the **Connector Management** page:

1. In the left navigation, click **Environments**, click **Clusters**, and then select a cluster.
1. On the **Overview** tab, open the **Connectors** section:
   - In SaaS, click **Manage** on the **Connectors** component tile.
   - In Self-Managed, click **View connectors** on the **Connectors** card. The card appears when the cluster has a connector runtime that Camunda Hub can reach.

The **Connector Management** page provides an overview of the connectors running on a cluster.

- The page shows each connector on a separate row.
- Use this page to review connector status, inspect details, and troubleshoot issues.
- Available details depend on the connector type.

**Note**
[Webhook connector](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook) names also include the names of any connector based on the webhook. For example, "_Webhook (aws:eventbridge, GitHubWebhook)_".

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors
