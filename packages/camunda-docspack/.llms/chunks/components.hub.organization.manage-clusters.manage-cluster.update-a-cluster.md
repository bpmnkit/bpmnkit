# Manage your cluster — Update a cluster

**Warning**
Updating a cluster is permanent. Updated clusters cannot be reverted to the previous version.

To update a cluster:

- In SaaS:
  - On the cluster's **Overview** tab, find the **Cluster details** section.
  - If an update is available, you'll see a **Review Update** button in the **Generation** row.
- In Self-Managed, review the [cluster configuration properties](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters).

Currently, updates do not automatically trigger backups. Camunda recommends [creating a manual backup](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/cluster-backups#create-a-manual-backup) before updating.

### Minor updates

If you update a cluster to another minor version, you cannot immediately update the cluster again until a 24-hour period has elapsed. This ensures all background processes have completed and the cluster is ready for further updates.

This does not apply when upgrading between generations of the same minor version.

| Example scenario           | Time limit applied?                                        |
| :------------------------- | :--------------------------------------------------------- |
| `8.8 gen22` to `8.9 gen1`  | 24 hours required before the cluster can be updated again. |
| `8.8 gen22` to `8.8 gen23` | No time limit applied.                                     |

**Note**
Clusters must be healthy before an update can be performed.

### Automated cluster updates

In SaaS, you can enable [automated patch updates](https://docs.camunda.io/docs/next/components/saas/auto-updates).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-cluster
