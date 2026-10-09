# Configuration — Connectivity — Advanced connectivity settings

```yaml
camunda:
  client:
    keep-alive: PT60S
    override-authority: host:port
    max-message-size: 4194304
    max-metadata-size: 4194304
    ca-certificate-path: path/to/certificate
    request-timeout: PT10S
    request-timeout-offset: PT1S
```

**Keep alive:** Time interval between keep alive messages sent to the gateway (default is 45s).

**Override authority:** The alternative authority to use, commonly in the form `host` or `host:port`.

**Max message size:** A custom `maxMessageSize` allows the client to receive larger or smaller responses from Zeebe. Technically, it specifies the `maxInboundMessageSize` of the gRPC channel (default 5MB).

**Max metadata size:** A custom `maxMetadataSize` allows the client to receive larger or smaller response headers from Camunda.

**CA certificate path:** Path to a root CA certificate to be used instead of the certificate in the default store.

**Request timeout:** The timeout for all requests sent to Camunda. There is an additional option to define the timeout for workers.

**Request timeout offset:** The offset being added to the timeout on asynchronous requests sent to Camunda to cover the network latency.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
