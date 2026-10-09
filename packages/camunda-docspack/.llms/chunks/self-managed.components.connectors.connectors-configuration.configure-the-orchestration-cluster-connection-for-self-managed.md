# Configuration — Configure the Orchestration Cluster connection for Self-Managed

### Connection URL

To connect to the Orchestration Cluster, provide the following configuration:

### env

```bash
CAMUNDA_CLIENT_MODE=self-managed
CAMUNDA_CLIENT_GRPCADDRESS=http://localhost:26500
CAMUNDA_CLIENT_RESTADDRESS=http://localhost:8080
```

### application.yaml

```yaml
camunda:
  client:
    mode: self-managed
    grpc-address: http://localhost:26500
    rest-address: http://localhost:8080
```

### HTTPS configuration

If using an HTTPS connection, you may need to provide a certificate to validate the Zeebe Gateway's certificate chain.

### env

```bash
CAMUNDA_CLIENT_CACERTIFICATEPATH=/path/to/certificate.pem
```

### application.yaml

```yaml
camunda:
  client:
    ca-certificate-path: /path/to/certificate.pem
```

### Authentication methods

Choose the authentication method for your environment:

### no-auth

By default, no authentication will be used.

**Environment variables**

```bash
CAMUNDA_CLIENT_AUTH_METHOD=none
```

**Application.yaml**

```yaml
camunda:
  client:
    auth:
      method: none
```

### basic-auth

To activate basic authentication:

**Environment variables**

```bash
CAMUNDA_CLIENT_AUTH_METHOD=basic
CAMUNDA_CLIENT_AUTH_USERNAME=<your username>
CAMUNDA_CLIENT_AUTH_PASSWORD=<your password>
```

**Application.yaml**

```yaml
camunda:
  client:
    auth:
      method: basic
      username: <your username>
      password: <your password>
```

### oidc

To activate OIDC-based authentication:

**Environment variables**

```bash
CAMUNDA_CLIENT_AUTH_METHOD=oidc
CAMUNDA_CLIENT_AUTH_CLIENTID=xxx
CAMUNDA_CLIENT_AUTH_CLIENTSECRET=xxx
CAMUNDA_CLIENT_AUTH_TOKENURL=http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token
CAMUNDA_CLIENT_AUTH_AUDIENCE=<your client id of Orchestration Cluster or configured audience>
CAMUNDA_CLIENT_AUTH_SCOPE=<your client id of Orchestration Cluster or configured audience>
```

**Application.yaml**

```yaml
camunda:
  client:
    auth:
      method: oidc
      client-id: <your client id>
      client-secret: <your client secret>
      token-url: http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token
      audience: <your client id of Orchestration Cluster or configured audience>
      scope: <your client id of Orchestration Cluster or configured audience>
```

**Notes for Microsoft Entra ID**

- Instead of `scope: CLIENT_ID_OC`, use: `scope: CLIENT_ID_OC + "/.default"`.
- The `token-url` is typically formatted as: `https://login.microsoftonline.com/<tenant_id>/oauth2/v2.0/token`.

**Note: Audience validation**
If you have configured the audiences property for the Orchestration Cluster (`camunda.security.authentication.oidc.audiences`), the Orchestration Cluster will validate the audience claim in the token against the configured audiences. Ensure your token has the correct audience from the Orchestration Cluster configuration, or add your audience in the configuration. This is often the client ID you used when setting up the Orchestration Cluster.

See the [Camunda Spring Boot Starter documentation](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started#self-managed) for more information on authentication properties.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
