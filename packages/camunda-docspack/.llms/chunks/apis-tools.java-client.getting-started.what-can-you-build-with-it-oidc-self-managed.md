# Java client — What can you build with it? — oidc-self-managed

**Use for:** Self-Managed production environments with OIDC-based authentication. Standard `client_secret_basic` authentication method.

```java
private static final String CAMUNDA_GRPC_ADDRESS = "[Address of Zeebe API (gRPC) - default: http://localhost:26500]";
private static final String CAMUNDA_REST_ADDRESS = "[Address of the Orchestration Cluster API - default: http://localhost:8080]";
// There are three ways to define the authorization server URL
private static final String CAMUNDA_AUTHORIZATION_SERVER_URL = "[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token]";
private static final String CAMUNDA_WELL_KNOWN_CONFIGURATION_URL = "[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/.well-known/openid-configuration]";
private static final String CAMUNDA_ISSUER_URL = "[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform]";

// Audience is the API that will receive the token, such as the Orchestration Cluster for example
private static final String AUDIENCE = "[Orchestration Cluster audience]";

// Scope is the permission requested from the IdP (or leave empty)
private static final String SCOPE = "[optional additional scopes]";

private static final String CLIENT_ID = "[Client ID registered in your IdP]";
private static final String CLIENT_SECRET = "[Client Secret]";

public static void main(String[] args) {
    CredentialsProvider credentialsProvider = new OAuthCredentialsProviderBuilder()
            // Select the authorization server configuration option according to your properties from above
            .authorizationServerUrl(CAMUNDA_AUTHORIZATION_SERVER_URL)
            .issuerUrl(CAMUNDA_ISSUER_URL)
            .wellKnownConfigurationUrl(CAMUNDA_WELL_KNOWN_CONFIGURATION_URL)
            // End authorization server
            .audience(AUDIENCE)
            .scope(SCOPE)
            .clientId(CLIENT_ID)
            .clientSecret(CLIENT_SECRET)
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

**Notes for Microsoft Entra ID**

- Use `scope=CLIENT_ID_OC + "/.default"` instead of `scope=CLIENT_ID_OC`.
- The issuer URL is typically in the format:

```
https://login.microsoftonline.com/<Microsoft Entra tenant ID>/v2.0
```

**Note: Audience validation**
If you have [configured the audiences property for the Orchestration Cluster (`camunda.security.authentication.oidc.audiences`)](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camunda.security.authentication.oidc), the Orchestration Cluster will validate the audience claim in the token against the configured audiences.

Make sure your token includes the correct audience from the Orchestration Cluster configuration, or add your audience to the configuration. Often this is the client ID you used when setting up the Orchestration Cluster.

**What this code does**

1. **Sets up OAuth2 authentication** – Configures the client to use OAuth tokens from your identity provider.
2. **Builds a secure client** – Establishes an encrypted connection to your self-managed cluster (default).
3. **Connects to both APIs** – Configures access to the Zeebe gRPC and Orchestration Cluster REST APIs.
4. **Tests the connection** – Verifies OAuth authentication by requesting cluster topology information.

**Environment variables option**  
You can also set connection details via environment variables to create the client more simply:

```bash
export CAMUNDA_GRPC_ADDRESS='[Address of Zeebe API (gRPC) - default: http://localhost:26500]'
export CAMUNDA_REST_ADDRESS='[Address of the Orchestration Cluster API - default: http://localhost:8080]'
# There are three ways to define the authorization server URL
export CAMUNDA_AUTHORIZATION_SERVER_URL='[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token]'
export CAMUNDA_WELL_KNOWN_CONFIGURATION_URL='[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/.well-known/openid-configuration]'
export CAMUNDA_ISSUER_URL='[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform]'

export CAMUNDA_TOKEN_AUDIENCE='[Audience]'
export CAMUNDA_CLIENT_ID='[Client ID]'
export CAMUNDA_CLIENT_SECRET='[Client Secret]'
```

```java
CamundaClient client = CamundaClient.newClientBuilder().build();
```

The client will automatically read the environment variables and configure the appropriate authentication method.

**Note**

- Ensure addresses use absolute URI format: `scheme://host(:port)`.
- By default, environment variables override any values provided in Java code. To give Java code values precedence, use the `.applyEnvironmentOverrides(false)` method on `OAuthCredentialsProviderBuilder`.
- The client adds an `Authorization` header to each request with the value `Bearer <token>`. The token is obtained from the authorization server, cached to avoid unnecessary requests, and refreshed lazily upon expiration.
- There are three ways to define the token URL. They're prioritized as follows:
  1. Provide the `camunda.client.auth.token-url`.
  2. Provide the issuer's well-known configuration URL `camunda.client.auth.well-known-configuration-url`. This extracts the token URL from the `token_url` field in the loaded configuration.
  3. Provide the issuer's URL `camunda.client.auth.issuer-url`. This generates the well-known configuration URL and extracts the token URL from the `token_url` field in the loaded configuration.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started
