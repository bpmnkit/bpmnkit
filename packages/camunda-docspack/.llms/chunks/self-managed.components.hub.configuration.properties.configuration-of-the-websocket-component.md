# Property reference — Configuration of the `websocket` component

The [WebSocket](https://en.wikipedia.org/wiki/WebSocket) server shipped with Camunda Hub Self-Managed is based on the [laravel-websockets](https://laravel.com/docs/10.x/broadcasting#open-source-alternatives-php) open source package and implements the [Pusher Channels Protocol](https://pusher.com/docs/channels/library_auth_reference/pusher-websockets-protocol/).

The `websocket` component is configured via environment variables.
When using the Camunda Helm chart, you can pass these variables via `camundaHub.websocket.env` in your `values.yaml`.
See the [Helm chart values docs](https://artifacthub.io/packages/helm/camunda/camunda-platform#webmodeler-parameters) for all available configuration options.

| Environment variable | Description                                                                                                                                                          | Example value | Default value |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| `PUSHER_APP_ID`      | ID of the single application/tenant configured for Camunda Hub.                                                                                                      | `hub`         | -             |
| `PUSHER_APP_KEY`     | A unique key used for authentication. Provide a random alphanumeric string of at least 20 characters.                                                                | \*\*\*        | -             |
| `PUSHER_APP_SECRET`  | A unique secret used for authentication. Provide a random alphanumeric string of at least 20 characters.                                                             | \*\*\*        | -             |
| `PUSHER_APP_PATH`    | [optional]Base path of the WebSocket endpoint. Can be used to expose the endpoint on a sub path instead of the domain root (e.g. `https://example.com/hub-ws`). | `/hub-ws`     | `/`           |

### Logging

| Environment variable | Description                                                                                                                     | Example value | Default value |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| `LOG_CHANNEL`        | [optional]Log channel driver, see [Laravel documentation](https://laravel.com/docs/10.x/logging#available-channel-drivers) | `single`      | `stack`       |

Refer to the [Advanced Logging Configuration Guide](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging#logging-configuration-for-the-websocket-component) for additional details on how to customize the `websocket` logging output.

### SSL

| Environment variable    | Description                                                                    | Example value                   | Default value |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------- | ------------- |
| `PUSHER_SSL_CERT`       | [optional]Path to a PEM-encoded SSL certificate file.                     | `/full/path/to/certificate.pem` | -             |
| `PUSHER_SSL_KEY`        | [optional]Path to a PEM-encoded private key file for the SSL certificate. | `/full/path/to/key.pem`         | -             |
| `PUSHER_SSL_PASSPHRASE` | [optional]Passphrase for the private key file.                            | `change-me`                     | -             |

Refer to the [advanced SSL configuration guide](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/ssl) for additional details on how to set up secure connections (incoming & outgoing) to the Camunda Hub components.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
