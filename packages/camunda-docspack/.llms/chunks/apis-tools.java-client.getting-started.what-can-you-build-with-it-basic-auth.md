# Java client — What can you build with it? — basic-auth

**Use for:** Development or testing environments with username/password protection.

```java
private static final String CAMUNDA_GRPC_ADDRESS = "[Address of Zeebe API (gRPC) - default: http://localhost:26500]";
private static final String CAMUNDA_REST_ADDRESS = "[Address of the Orchestration Cluster API - default: http://localhost:8080]";
private static final String CAMUNDA_BASIC_AUTH_USERNAME = "[Your username - default: demo]";
private static final String CAMUNDA_BASIC_AUTH_PASSWORD = "[Your password - default: demo]";

public static void main(String[] args) {

    CredentialsProvider credentialsProvider = new BasicAuthCredentialsProviderBuilder()
            .username(CAMUNDA_BASIC_AUTH_USERNAME)
            .password(CAMUNDA_BASIC_AUTH_PASSWORD)
            .build();

    try (CamundaClient client = CamundaClient.newClientBuilder()
            .grpcAddress(URI.create(CAMUNDA_GRPC_ADDRESS))
            .restAddress(URI.create(CAMUNDA_REST_ADDRESS))
            .credentialsProvider(credentialsProvider)
            .build()) {

        // Test the connection
        client.newTopologyRequest().execute();
        System.out.println("Connected to Camunda 8!");
    }
}
```

**What this code does**

1. **Sets up username/password authentication** – Configures the client to use basic credentials.
2. **Builds a client using the protocol-specified transport** – Establishes an unencrypted connection if the addresses use `http` or an encrypted connection if they use `https`.
3. **Connects to both APIs** – Configures access to the Zeebe gRPC and Orchestration Cluster REST APIs.
4. **Tests the connection** – Verifies authentication by requesting cluster topology information.

**Environment variables option**  
You can also set connection details via environment variables to create the client more simply:

```bash
export CAMUNDA_GRPC_ADDRESS='[Address of Zeebe API (gRPC) - default: http://localhost:26500]'
export CAMUNDA_REST_ADDRESS='[Address of the Orchestration Cluster API - default: http://localhost:8080]'
export CAMUNDA_BASIC_AUTH_USERNAME='[Your username - default: demo]'
export CAMUNDA_BASIC_AUTH_PASSWORD='[Your password - default: demo]'
```

```java
CamundaClient client = CamundaClient.newClientBuilder().build();
```

The client will automatically read the environment variables and configure the appropriate authentication method.

**Note**

- Ensure addresses use absolute URI format: `scheme://host(:port)`.
- By default, environment variables override any values provided in Java code. To give Java code values precedence, use the `.applyEnvironmentOverrides(false)` method on `BasicAuthCredentialsProviderBuilder`.
- The client adds an `Authorization` header to each request with the value `Basic username:password` (where `username:password` is base64 encoded).

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started
