# Java client — What can you build with it? — no-auth

**Use for:** Local development when security is not required.

```java
private static final String CAMUNDA_GRPC_ADDRESS = "[Address of Zeebe API (gRPC) - default: http://localhost:26500]";
private static final String CAMUNDA_REST_ADDRESS = "[Address of the Orchestration Cluster API - default: http://localhost:8080]";

public static void main(String[] args) {

    try (CamundaClient client = CamundaClient.newClientBuilder()
            .grpcAddress(URI.create(CAMUNDA_GRPC_ADDRESS))
            .restAddress(URI.create(CAMUNDA_REST_ADDRESS))
            .build()) {

        // Test the connection
        client.newTopologyRequest().execute();
        System.out.println("Connected to Camunda 8!");
    }
}
```

**What this code does**

1. **Creates a no-authentication provider** – Configures the client to skip authentication.
2. **Builds a client using the protocol-specified transport** – Uses plaintext or TLS depending on whether the addresses use `http` or `https`.
3. **Connects to both APIs** – Configures access to the Zeebe gRPC and Orchestration Cluster REST APIs.
4. **Tests the connection** – Verifies connectivity by requesting cluster topology information.

**Environment variables option**  
You can also configure the client using environment variables:

```bash
export CAMUNDA_GRPC_ADDRESS='[Address of Zeebe API (gRPC) - default: http://localhost:26500]'
export CAMUNDA_REST_ADDRESS='[Address of the Orchestration Cluster API - default: http://localhost:8080]'
```

```java
CamundaClient client = CamundaClient.newClientBuilder().build();
```

The client will automatically read these environment variables and configure the appropriate authentication method.

Ensure addresses are in absolute URI format: `scheme://host(:port)`. The protocol (`http` or `https`) determines whether the connection is encrypted.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started
