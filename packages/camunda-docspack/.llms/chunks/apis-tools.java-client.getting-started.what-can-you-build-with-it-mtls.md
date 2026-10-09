# Java client — What can you build with it? — mTLS

**Use for:** Production environments with mTLS certificate-based client authentication.

Several identity providers, such as Keycloak, support client mTLS authentication as an alternative to `client_secret_basic`.

**Prerequisites**

- Properly configured KeyStore and TrustStore
- Both your application and identity provider share the same CA trust certificates
- Certificates for the identity provider are signed by a trusted CA
- The application DN is registered in the identity provider client authorization details

```java
private static final String CAMUNDA_GRPC_ADDRESS = "[Address of Zeebe API (gRPC) - default: http://localhost:26500]";
private static final String CAMUNDA_REST_ADDRESS = "[Address of the Orchestration Cluster API - default: http://localhost:8080]";
// There are three ways to define the authorization server URL
private static final String CAMUNDA_AUTHORIZATION_SERVER_URL = "[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token]";
private static final String CAMUNDA_WELL_KNOWN_CONFIGURATION_URL = "[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/.well-known/openid-configuration]",
private static final String CAMUNDA_ISSUER_URL = "[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform]";

private static final String AUDIENCE = "[Audience - default: zeebe-api]";
private static final String CLIENT_ID = "[Client ID]";
private static final Path KEYSTORE_PATH = Paths.get("/path/to/keystore.p12");
private static final String KEYSTORE_PASSWORD = "password";
private static final String KEYSTORE_KEY_PASSWORD = "password";
private static final Path TRUSTSTORE_PATH = Paths.get("/path/to/truststore.jks");
private static final String TRUSTSTORE_PASSWORD = "password";

public static void main(String[] args) {

    CredentialsProvider credentialsProvider = new OAuthCredentialsProviderBuilder()
            // Select the authorization server configuration option according to your properties from above
            .authorizationServerUrl(CAMUNDA_AUTHORIZATION_SERVER_URL)
            .issuerUrl(CAMUNDA_ISSUER_URL)
            .wellKnownConfigurationUrl(CAMUNDA_WELL_KNOWN_CONFIGURATION_URL)
            // End authorization server
            .audience(AUDIENCE)
            .clientId(CLIENT_ID)
            .keystorePath(KEYSTORE_PATH)
            .keystorePassword(KEYSTORE_PASSWORD)
            .keystoreKeyPassword(KEYSTORE_KEY_PASSWORD)
            .truststorePath(TRUSTSTORE_PATH)
            .truststorePassword(TRUSTSTORE_PASSWORD)
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

1. **Sets up mTLS certificate authentication** – Configures the client to authenticate using client certificates with OAuth.
2. **Builds a secure client** – Establishes an encrypted connection using mutual TLS authentication.
3. **Connects to both APIs** – Configures access to the Zeebe gRPC and Orchestration Cluster REST APIs.
4. **Tests the connection** – Verifies certificate authentication by requesting cluster topology information.

**Environment variables option**  
You can also set connection details via environment variables to create the client more simply:

```bash
export CAMUNDA_GRPC_ADDRESS='[Address of Zeebe API (gRPC) - default: http://localhost:26500]'
export CAMUNDA_REST_ADDRESS='[Address of the Orchestration Cluster API - default: http://localhost:8080]'
# There are three ways to define the authorization server URL
export CAMUNDA_AUTHORIZATION_SERVER_URL='[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token]'
export CAMUNDA_WELL_KNOWN_CONFIGURATION_URL='[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform/.well-known/openid-configuration]'
export CAMUNDA_ISSUER_URL='[OAuth URL e.g. http://localhost:18080/auth/realms/camunda-platform]'

export CAMUNDA_TOKEN_AUDIENCE='[Audience - default: zeebe-api]'
export CAMUNDA_CLIENT_ID='[Client ID]'
export CAMUNDA_CLIENT_SECRET='[Client Secret]'
export CAMUNDA_SSL_CLIENT_KEYSTORE_PATH='[Keystore path]'
export CAMUNDA_SSL_CLIENT_KEYSTORE_SECRET='[Keystore password]'
export CAMUNDA_SSL_CLIENT_KEYSTORE_KEY_SECRET='[Keystore material password]'
export CAMUNDA_SSL_CLIENT_TRUSTSTORE_PATH='[Truststore path]'
export CAMUNDA_SSL_CLIENT_TRUSTSTORE_SECRET='[Truststore password]'
```

```java
CamundaClient client = CamundaClient.newClientBuilder().build();
```

The client automatically reads environment variables and configures the appropriate authentication method.

Refer to your identity provider documentation for configuring mutual TLS authentication. For example, see [Keycloak](https://www.keycloak.org/server/mutual-tls).

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
