# Camunda Orchestration Cluster API connector — Enter your cluster information

Choose between **Camunda SaaS** and **Camunda Self-managed** depending on your Camunda 8 installation type. The input fields will update accordingly.

### SaaS clusters

If you are using a SaaS cluster, you will be required to provide your **Region** and **Cluster ID**. You will see these values when you [create an API client](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) for your cluster.

### Self-Managed clusters

If you are using a Self-Managed cluster, you need to provide two URLs:

- URL of your OAuth token endpoint
- Base URL of the Orchestration Cluster REST API (must end with `/v2`)

If you are testing this connector on your local machine with the Camunda 8 Docker Compose setup, set the following URLs:

- OAuth Token endpoint: `http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token`
- Base URL: `http://localhost:8080/v2`

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/orchestration-cluster-api
