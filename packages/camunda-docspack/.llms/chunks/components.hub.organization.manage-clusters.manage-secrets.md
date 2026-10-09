# Manage connector secrets

Create secrets and reference them in your connectors without exposing sensitive information in your BPMN processes.

Create [SaaS-managed secrets](https://docs.camunda.io/docs/next/reference/glossary#saas-managed-secret) and reference them in your connectors without exposing sensitive information in your BPMN processes.

**Warning**
Secrets on the **Cluster secrets** tab are managed at the cluster level, so ensure you deploy your processes to the cluster that contains the necessary secrets.
If you deploy and the secret is missing, [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) will show an incident.


## Create a secret

To manage secrets in SaaS:

1. In the left navigation under **Clusters**, select a cluster.
1. On the **Cluster secrets** tab, click **Create new secret**.

   ![secrets](./img/cluster-detail-secrets.png)

1. Provide a **Key** for your secret that you will use to reference your secret from your connector.
1. Provide the **Value** that will be assigned to the **Key**.

   ![secrets-create](./img/cluster-detail-secrets-create.png)

1. Click **Create** and view your new secret in the list.

**Tip**
In Self-Managed, review [connector secrets configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets
