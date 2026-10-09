# Configure the audit log — Configure the audit log

1. In **Camunda Hub**, open **Clusters**.
2. Select an applicable cluster.
3. From the cluster configurations tabs, select **Audit Log**.
4. Select the user operations and client operations to record.
5. Click **Update**.


## Enable or disable the audit log

1. In **Camunda Hub**, open **Clusters**.
2. Select an applicable cluster.
3. From the cluster configurations tabs, select **Audit Log**.
4. Click **Enable audit log** or **Disable audit log**, depending on the state of your cluster.

When disabled, new operations are not recorded. Changing this setting doesn't cause the existing audit log data to be immediately purged. Instead, it will be cleaned up according to the secondary storage retention settings. Until then, you can continue to access the data in [Operate](https://docs.camunda.io/docs/next/components/operate/userguide/audit-operations), [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/userguide/audit-task-history), [Admin](https://docs.camunda.io/docs/next/components/admin/audit-operations), and the [Search API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-audit-logs.api).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/configure-audit-log
