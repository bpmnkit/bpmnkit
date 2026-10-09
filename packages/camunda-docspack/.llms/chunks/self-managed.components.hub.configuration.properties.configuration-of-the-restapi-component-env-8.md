# Property reference — Configuration of the `restapi` component — env

| Environment variable      | Description                                                                                                                                   | Example value    | Default value |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- |
| `RESTAPI_PUSHER_HOST`     | [Internal](#notes-on-host-names-and-port-numbers) host name of the WebSocket server.                                                          | `hub-websockets` | -             |
| `RESTAPI_PUSHER_PORT`     | [Internal](#notes-on-host-names-and-port-numbers) port number of the WebSocket server.                                                        | `8060`           | `8060`        |
| `RESTAPI_PUSHER_APP_ID`   | _must be the same as_ [`PUSHER_APP_ID`](#configuration-of-the-websocket-component)                                                            | `hub`            | -             |
| `RESTAPI_PUSHER_KEY`      | _must be the same as_ [`PUSHER_APP_KEY`](#configuration-of-the-websocket-component)                                                           | \*\*\*           | -             |
| `RESTAPI_PUSHER_SECRET`   | _must be the same as_ [`PUSHER_APP_SECRET`](#configuration-of-the-websocket-component)                                                        | \*\*\*           | -             |
| `CLIENT_PUSHER_HOST`      | [External](#notes-on-host-names-and-port-numbers) host name on which the Camunda Hub client accesses the WebSocket server from the browser.   | `ws.example.com` | -             |
| `CLIENT_PUSHER_PORT`      | [External](#notes-on-host-names-and-port-numbers) port number on which the Camunda Hub client accesses the WebSocket server from the browser. | `443`            | `80`          |
| `CLIENT_PUSHER_PATH`      | [optional]_must be the same as_ [`PUSHER_APP_PATH`](#configuration-of-the-websocket-component)                                           | `hub-ws`         | `/`           |
| `CLIENT_PUSHER_FORCE_TLS` | Enable TLS encryption for WebSocket connections initiated by the browser.                                                                     | `true`           | `false`       |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
