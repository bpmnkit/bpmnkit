# Secure client communication

Zeebe supports TLS between the gateway and all the officially supported clients. In this section, we will review how to configure these components.

Zeebe supports transport layer security (TLS v1.3) between the gateway and all the officially supported clients. In this section, we will review how to configure these components.


## Gateway

TLS in the gateway is disabled by default. This means that if you are just experimenting with Zeebe or in development, there is no configuration needed. However, if you want to enable authentication, we strongly recommend you enable TLS between the client and the gateway. To do so, you will need to configure both the REST and gRPC parts of the gateway separately.

**Note**
You can use different certificates, or even reuse the same configuration for both protocols, as each are configured independently from the other.

### gRPC

You can configure TLS for the gRPC gateway in the `security` section of the configuration files. The following configurations are present in both `gateway.default.yaml` and `config/defaults.yaml`, the file you should edit depends on whether you are using a standalone gateway or an embedded gateway.

```yaml
---
security:
  # Enables TLS authentication between clients and the gateway
  enabled: false

  # Sets the path to the certificate chain file
  certificateChainPath:

  # Sets the path to the private key file location
  privateKeyPath:
```

`enabled` should be either `true` or `false`, where true will enable TLS authentication between client and gateway, and false will disable it. `certificateChainPath` and `privateKeyPath` are used to configure the certificate with which the server will authenticate itself. `certificateChainPath` should be a file path pointing to a certificate chain in PEM format representing the server's certificate, and `privateKeyPath` is a file path pointing to the certificate's PKCS8 private key, also in PEM format.

Additionally, as you can see in the configuration file, each value can also be configured through an environment variable. The environment variable to use again depends on whether you are using a standalone gateway or an embedded gateway.

### REST

The REST server is simply a Spring Boot server, and as such, [any of the common server properties can be applied to it](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties.server). Note that, as of 8.5.0, it is a _reactive_ server, meaning **none of the servlet properties will have any effect**.

To enable TLS for the REST server, you will need to configure the properties under the `server.ssl` tree. To enable TLS, you will need to at least specify a certificate and private key. This can be done using a PEM certificate chain file with its private key, as seen in the gRPC section, or via a key store. For example, with a PEM file:

```yaml
server:
  ssl:
    enabled: true
    certificate: /path/to/my/certificate.pem
    certificate-private-key: /path/to/my/private.key
```

[This Spring blog post](https://spring.io/blog/2023/06/07/securing-spring-boot-applications-with-ssl) provides a great tutorial on how to use other options to configure the server security.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-client-communication
