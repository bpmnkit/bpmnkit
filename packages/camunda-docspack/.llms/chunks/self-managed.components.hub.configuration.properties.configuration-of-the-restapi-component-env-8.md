# Property reference — Configuration of the `restapi` component — env

| Environment variable                 | Description                                                                                                                                   | Example value    | Default value |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- |
| `CAMUNDA_HUB_PUSHER_HOST`            | [Internal](#notes-on-host-names-and-port-numbers) host name of the WebSocket server.                                                          | `hub-websockets` | -             |
| `CAMUNDA_HUB_PUSHER_PORT`            | [Internal](#notes-on-host-names-and-port-numbers) port number of the WebSocket server.                                                        | `8060`           | `8060`        |
| `CAMUNDA_HUB_PUSHER_APPID`           | _must be the same as_ [`PUSHER_APP_ID`](#configuration-of-the-websocket-component)                                                            | `hub`            | -             |
| `CAMUNDA_HUB_PUSHER_KEY`             | _must be the same as_ [`PUSHER_APP_KEY`](#configuration-of-the-websocket-component)                                                           | \*\*\*           | -             |
| `CAMUNDA_HUB_PUSHER_SECRET`          | _must be the same as_ [`PUSHER_APP_SECRET`](#configuration-of-the-websocket-component)                                                        | \*\*\*           | -             |
| `CAMUNDA_HUB_PUSHER_CLIENT_HOST`     | [External](#notes-on-host-names-and-port-numbers) host name on which the Camunda Hub client accesses the WebSocket server from the browser.   | `ws.example.com` | -             |
| `CAMUNDA_HUB_PUSHER_CLIENT_PORT`     | [External](#notes-on-host-names-and-port-numbers) port number on which the Camunda Hub client accesses the WebSocket server from the browser. | `443`            | `80`          |
| `CAMUNDA_HUB_PUSHER_CLIENT_PATH`     | [optional]_must be the same as_ [`PUSHER_APP_PATH`](#configuration-of-the-websocket-component)                                           | `hub-ws`         | `/`           |
| `CAMUNDA_HUB_PUSHER_CLIENT_FORCETLS` | Enable TLS encryption for WebSocket connections initiated by the browser.                                                                     | `true`           | `false`       |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
