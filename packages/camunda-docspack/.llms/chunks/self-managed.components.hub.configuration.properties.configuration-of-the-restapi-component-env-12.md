# Property reference — Configuration of the `restapi` component — env

| Environment variable                          | Description                                                                          | Example value                        | Default value |
| --------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ | ------------- |
| `SERVER_SSL_ENABLED`                          | [optional]Whether to enable SSL support.                                        | `true`                               | `false`       |
| `SERVER_SSL_CERTIFICATE`                      | [optional]Path to a PEM-encoded SSL certificate file.                           | `file:/full/path/to/certificate.pem` | -             |
| `SERVER_SSL_CERTIFICATEPRIVATEKEY`            | [optional]Path to a PEM-encoded private key file for the SSL certificate.       | `file:/full/path/to/key.pem`         | -             |
| `MANAGEMENT_SERVER_SSL_ENABLED`               | [optional]Whether to enable SSL support for the management server routes.       | `true`                               | `false`       |
| `MANAGEMENT_SERVER_SSL_CERTIFICATE`           | [optional]Path to a PEM-encoded SSL certificate file.                           | `file:/full/path/to/certificate.pem` | -             |
| `MANAGEMENT_SERVER_SSL_CERTIFICATEPRIVATEKEY` | [optional]Path to a PEM-encoded private key file for the SSL certificate.       | `file:/full/path/to/key.pem`         | -             |
| `CAMUNDA_HUB_PUSHER_SSLENABLED`               | [optional]Whether to enable communication via SSL to the `websocket` component. | `true`                               | `false`       |

Refer to the [advanced SSL configuration guide](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/ssl) for additional details on how to set up secure connections (incoming & outgoing) to the Camunda Hub components.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
