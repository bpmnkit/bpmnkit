# Secure client communication — Clients

Unlike the Zeebe Gateway, TLS is enabled by default in all of Zeebe's supported clients. The following sections show how to disable or properly configure each client.

**Note**
Disabling TLS should only be done for testing or development. During production deployments, clients and gateways should be properly configured to establish secure connections.

### Java

Without any configuration, the client looks in the system's certificate store for a CA certificate with which to validate the Zeebe Gateway's certificate chain. If you wish to use TLS without having to install a certificate in client's system, you can specify a CA certificate:

```java
public class SecureClient {
    public static void main(final String[] args) {
        final CamundaClient client = CamundaClient.newClientBuilder().caCertificatePath("path/to/certificate").build();

        // ...
    }
}
```

Alternatively, use the `ZEEBE_CA_CERTIFICATE_PATH` environment variable to override the code configuration.

To disable TLS in a Java client, use the `ZEEBE_INSECURE_CONNECTION` environment variable. To enable an insecure connection, set it to **true**. To use a secure connection, set it to any non-empty value other than **true**. Setting the environment variable to an empty string is equivalent to unsetting it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-client-communication
