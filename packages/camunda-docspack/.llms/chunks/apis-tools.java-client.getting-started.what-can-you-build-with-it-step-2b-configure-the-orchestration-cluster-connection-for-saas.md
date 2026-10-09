# Java client — What can you build with it? — Step 2b: Configure the Orchestration Cluster connection for SaaS

**Use for:** Camunda 8 SaaS environments.
Get the values below from your [Camunda Hub client credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client).

```java
private static final String CAMUNDA_CLUSTER_ID = "[Cluster ID from Hub]";
private static final String CAMUNDA_CLIENT_ID = "[Client ID from Hub]";
private static final String CAMUNDA_CLIENT_SECRET = "[Client Secret from Hub]";
private static final String CAMUNDA_CLUSTER_REGION = "[Cluster Region from Hub]";

public static void main(String[] args) {

    try (CamundaClient client = CamundaClient.newCloudClientBuilder()
            .withClusterId(CAMUNDA_CLUSTER_ID)
            .withClientId(CAMUNDA_CLIENT_ID)
            .withClientSecret(CAMUNDA_CLIENT_SECRET)
            .withRegion(CAMUNDA_CLUSTER_REGION)
            .build()) {

        // Test the connection
        client.newTopologyRequest().execute();
        System.out.println("Connected to Camunda 8!");
    }
}
```

**What this code does**

1. **Sets up SaaS authentication** – Configures the client to connect to Camunda 8 SaaS using your cluster credentials.
2. **Builds a cloud client** – Creates a client optimized for SaaS with automatic endpoint discovery.
3. **Connects to your cluster** – Uses your cluster ID and region to locate and connect to the correct SaaS instance.
4. **Tests the connection** – Verifies SaaS authentication by requesting cluster topology information.

**Environment variables option**  
You can also set connection details via environment variables to create the client more simply:

```bash
export CAMUNDA_GRPC_ADDRESS='[Orchestration Cluster gRPC Address from Hub]'
export CAMUNDA_REST_ADDRESS='[Orchestration Cluster REST Address from Hub]'
export CAMUNDA_OAUTH_URL='[OAuth URL from Hub]'
export CAMUNDA_TOKEN_AUDIENCE='[Audience from Hub - default: zeebe.camunda.io]'
export CAMUNDA_CLIENT_ID='[Client ID from Hub]'
export CAMUNDA_CLIENT_SECRET='[Client Secret from Hub]'
```

```java
CamundaClient client = CamundaClient.newClientBuilder().build();
```

The client will automatically read the environment variables and configure the appropriate authentication method.

**Note**
Ensure addresses are in absolute URI format: `scheme://host(:port)`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started
