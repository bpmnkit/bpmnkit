# SSL — Configuring secure connections for Camunda Hub components

### Configure `restapi` SSL certificate

SSL can be configured declaratively by setting the respective properties offered by Spring Boot (make sure that the provided certificate path is accessible from the container, for example via a mounted volume):

### envVars

```
RESTAPI_SERVER_URL=https://web-modeler.example.com

SERVER_SSL_ENABLED=true
SERVER_SSL_CERTIFICATE=file:/full/path/to/certificate.pem
SERVER_SSL_CERTIFICATE_PRIVATE_KEY=file:/full/path/to/key.pem
```

Additionally, you can configure SSL separately for the management routes of the `restapi` component:

```
MANAGEMENT_SERVER_SSL_ENABLED=true
MANAGEMENT_SERVER_SSL_CERTIFICATE=file:/full/path/to/certificate.pem
MANAGEMENT_SERVER_SSL_CERTIFICATE_PRIVATE_KEY=file:/full/path/to/key.pem
```

### applicationYaml

```yaml
camunda.hub.server.url: https://web-modeler.example.com

server:
  ssl:
    enabled: true
    certificate: file:/full/path/to/certificate.pem
    certificate-private-key: file:/full/path/to/key.pem
```

Additionally, you can configure SSL separately for the management routes of the `restapi` component:

```yaml
management:
  server:
    ssl:
      enabled: true
      certificate: file:/full/path/to/certificate.pem
      certificate-private-key: file:/full/path/to/key.pem
```

Refer to the [Spring Boot documentation](https://docs.spring.io/spring-boot/how-to/webserver.html#howto.webserver.configure-ssl) for more information on configuration options.

#### Use secure connections between the `restapi` and `websocket` components

To use secure connections between the `restapi` and `websocket` components:

### envVars

```
RESTAPI_PUSHER_SSL_ENABLED=true
```

### applicationYaml

```yaml
camunda.hub.pusher.ssl-enabled: true
```

### Configure `websocket` SSL certificate

SSL can be configured by setting the following environment variables (make sure that the provided certificate path is accessible from the container, e.g. via a mounted volume):

```
PUSHER_SSL_CERT=/full/path/to/certificate.pem
PUSHER_SSL_KEY=/full/path/to/key.pem
PUSHER_SSL_PASSPHRASE=your-passphrase
```

**Info**

Currently, there is no option to configure SSL for the `websocket` management routes separately from the application routes.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/ssl
