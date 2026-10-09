# Broker configuration — Configuration — server

The `server` configuration allows you to configure the main REST server. Below are a few common ones, but you can find a more exhaustive list [in the official Spring documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties.server).

| Field   | Description                                                                                                                     | Example value |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| address | Sets the address the REST server binds to. This setting can also be overridden using the environment variable `SERVER_ADDRESS`. | 0.0.0.0       |
| port    | Sets the port the REST server binds to. This setting can also be overridden using the environment variable `SERVER_PORT`.       | 8080          |

#### server.compression

| Field   | Description                                                                                                                                                                        | Example value |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled | If true, enables compression of responses for the Orchestration Cluster REST API. This setting can also be overridden using the environment variable `SERVER_COMPRESSION_ENABLED`. | false         |

#### server.ssl

Allows you to configure the SSL security for the REST server.

| Field                   | Description                                                                                                                                                                     | Example value |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled                 | If true, enables TLS for the Orchestration Cluster REST API. This setting can also be overridden using the environment variable `SERVER_SSL_ENABLED`.                           | false         |
| certificate             | The path to a PEM encoded certificate. This setting can also be overridden using the environment variable `SERVER_SSL_CERTIFICATE`.                                             |               |
| certificate-private-key | The path to a PKCS1 or PKCS8 private key for the configured certificate. This setting can also be overridden using the environment variable `SERVER_SSL_CERTIFICATEPRIVATEKEY`. |               |

#### YAML snippet

```yaml
server:
  host: 0.0.0.0
  port: 8080
  compression:
    enabled: true
  ssl:
    enabled: true
    certificate: /path/to/my/cert.pem
    certificate-private-key: /path/to/my/private.key
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
