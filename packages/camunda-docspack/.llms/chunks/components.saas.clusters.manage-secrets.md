# Manage connector secrets

Create secrets and reference them in your connectors without exposing sensitive information in your BPMN processes.

Create [SaaS-managed secrets](https://docs.camunda.io/docs/next/reference/glossary#saas-managed-secret) and reference them in your connectors without exposing sensitive information in your BPMN processes.

**Note**
This page applies to Camunda 8 SaaS. For clusters in Self-Managed, see [clusters in Self-Managed](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/index), and [connector secrets configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration).

**Warning**
Secrets on the **Cluster secrets** tab are managed at the cluster level, so ensure you deploy your processes to the cluster that contains the necessary secrets.
If you deploy and the secret is missing, [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) will show an incident.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets
