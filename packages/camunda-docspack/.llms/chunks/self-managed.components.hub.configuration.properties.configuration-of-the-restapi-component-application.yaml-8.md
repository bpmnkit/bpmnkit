# Property reference — Configuration of the `restapi` component — application.yaml

| Property                              | Description                                                                                                                                   | Example value    | Default value |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- |
| `camunda.hub.pusher.host`             | [Internal](#notes-on-host-names-and-port-numbers) host name of the WebSocket server.                                                          | `hub-websockets` | -             |
| `camunda.hub.pusher.port`             | [Internal](#notes-on-host-names-and-port-numbers) port number of the WebSocket server.                                                        | `8060`           | `8060`        |
| `camunda.hub.pusher.app-id`           | _must be the same as_ [`PUSHER_APP_ID`](#configuration-of-the-websocket-component)                                                            | `hub`            | -             |
| `camunda.hub.pusher.key`              | _must be the same as_ [`PUSHER_APP_KEY`](#configuration-of-the-websocket-component)                                                           | \*\*\*           | -             |
| `camunda.hub.pusher.secret`           | _must be the same as_ [`PUSHER_APP_SECRET`](#configuration-of-the-websocket-component)                                                        | \*\*\*           | -             |
| `camunda.hub.pusher.client.host`      | [External](#notes-on-host-names-and-port-numbers) host name on which the Camunda Hub client accesses the WebSocket server from the browser.   | `ws.example.com` | -             |
| `camunda.hub.pusher.client.port`      | [External](#notes-on-host-names-and-port-numbers) port number on which the Camunda Hub client accesses the WebSocket server from the browser. | `443`            | `80`          |
| `camunda.hub.pusher.client.path`      | [optional]_must be the same as_ [`PUSHER_APP_PATH`](#configuration-of-the-websocket-component)                                           | `/hub-ws`        | `/`           |
| `camunda.hub.pusher.client.force-tls` | Enable TLS encryption for WebSocket connections initiated by the browser.                                                                     | `true`           | `false`       |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
