# Property reference — Configuration of the `restapi` component — application.yaml

| Property                                        | Description                                                                          | Example value                        | Default value |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ | ------------- |
| `server.ssl.enabled`                            | [optional]Whether to enable SSL support.                                        | `true`                               | `false`       |
| `server.ssl.certificate`                        | [optional]Path to a PEM-encoded SSL certificate file.                           | `file:/full/path/to/certificate.pem` | -             |
| `server.ssl.certificate-private-key`            | [optional]Path to a PEM-encoded private key file for the SSL certificate.       | `file:/full/path/to/key.pem`         | -             |
| `management.server.ssl.enabled`                 | [optional]Whether to enable SSL support for the management server routes.       | `true`                               | `false`       |
| `management.server.ssl.certificate`             | [optional]Path to a PEM-encoded SSL certificate file.                           | `file:/full/path/to/certificate.pem` | -             |
| `management.server.ssl.certificate-private-key` | [optional]Path to a PEM-encoded private key file for the SSL certificate.       | `file:/full/path/to/key.pem`         | -             |
| `camunda.hub.pusher.ssl-enabled`                | [optional]Whether to enable communication via SSL to the `websocket` component. | `true`                               | `false`       |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
