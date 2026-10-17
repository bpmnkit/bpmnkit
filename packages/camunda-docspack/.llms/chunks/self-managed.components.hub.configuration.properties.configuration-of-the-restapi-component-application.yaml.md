# Property reference — Configuration of the `restapi` component — application.yaml

| Property                        | Description                                                                                                                                                   | Example value                                            | Default value |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- |
| `camunda.hub.server.url`        | URL at which users access Camunda Hub in the browser (used to construct redirect URLs in the client-side login flow as well as links in notification emails). | `https://hub.example.com`,`https://example.com/hub` | -             |
| `server.servlet.context-path`   | [optional]Context path of the URL. Must be set if `camunda.hub.server.url` does not point to the root path of a (sub-)domain.                            | `/hub`                                                   | -             |
| `camunda.hub.server.https-only` | [optional]Enforce the usage of HTTPS when users access Camunda Hub (by redirecting from `http://` to `https://`).                                        | `true`                                                   | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
