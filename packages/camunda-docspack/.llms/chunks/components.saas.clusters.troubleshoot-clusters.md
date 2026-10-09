# Troubleshoot clusters

Review common issues and how to resolve them.

Review common issues and how to resolve them.

**Note**
This page applies to Camunda 8 SaaS. For clusters in Self-Managed, see [clusters in Self-Managed](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index).


## I cannot connect to Zeebe

- Check if your [API client](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients) has the necessary rights. To interact with Zeebe, the **Scope** `Zeebe` must be set.
- Check if your credentials are configured correctly. There is a community-supported CLI tool that allows you to check the status: [`zbctl`](https://www.npmjs.com/package/zbctl). With the command `zbctl status`, you can read the topology. If this command works, the connection can be established.
- Check if your cluster is **Healthy**: A Zeebe cluster may be temporarily unavailable. To check if your cluster is healthy, click **Environments** in the left navigation, and then click **Clusters**. Click on the cluster to view its details for a closer view of the status over all components (Zeebe, Operate, Tasklist, Optimize).

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/troubleshoot-clusters
