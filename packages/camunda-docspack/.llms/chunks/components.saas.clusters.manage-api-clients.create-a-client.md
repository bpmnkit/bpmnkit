# Manage API clients — Create a client

To create a client, take the following steps:

1. In Camunda Hub, in the left navigation, click **Environments**, and then click **Clusters**.
2. Select a cluster.
3. Click the **API** tab.
4. Click **Create new client**.

   ![cluster-details](./img/cluster-detail-clients.png)

5. Provide a **Client Name** and [**Scopes**](#scopes).

   ![create-client](./img/cluster-details-create-client.png)

6. Click **Create**.
7. Copy or download your client credentials.

Ensure you keep the generated client credentials in a safe place. The **client secret** will not be shown again.

![created-client](./img/cluster-details-created-client.png)

The downloaded file contains all necessary information to communicate with your Zeebe instance in the future:

- `ZEEBE_ADDRESS`: Address where your cluster can be reached.
- `ZEEBE_CLIENT_ID` and `ZEEBE_CLIENT_SECRET`: Credentials to request a new access token.
- `ZEEBE_AUTHORIZATION_SERVER_URL`: A new token can be requested at this address.
- `ZEEBE_TOKEN_AUDIENCE`: The audience for a Zeebe token request.
- `CAMUNDA_CLUSTER_ID`: The UUID of the cluster.
- `CAMUNDA_CLUSTER_REGION`: The region of the cluster.
- `CAMUNDA_CREDENTIALS_SCOPES`: A comma-separated list of the scopes this credential set is valid for.
- `CAMUNDA_OAUTH_URL`: A new token can be requested at this address using the credentials. Duplicates the earlier Zeebe-focused variable.

Depending on the scopes granted to these client credentials, the following variables may also be present:

- `CAMUNDA_TASKLIST_BASE_URL`: The base URL for Tasklist.
- `CAMUNDA_OPERATE_BASE_URL`: The base URL for Operate.
- `CAMUNDA_OPTIMIZE_BASE_URL`: The base URL for Optimize.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients
