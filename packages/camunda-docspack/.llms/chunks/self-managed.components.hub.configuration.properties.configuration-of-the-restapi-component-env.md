# Property reference — Configuration of the `restapi` component — env

| Environment variable           | Description                                                                                                                                                   | Example value                                            | Default value |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- |
| `CAMUNDA_HUB_SERVER_URL`       | URL at which users access Camunda Hub in the browser (used to construct redirect URLs in the client-side login flow as well as links in notification emails). | `https://hub.example.com`,`https://example.com/hub` | -             |
| `SERVER_SERVLET_CONTEXTPATH`   | [optional]Context path of the URL. Must be set if `CAMUNDA_HUB_SERVER_URL` does not point to the root path of a (sub-)domain.                            | `/hub`                                                   | -             |
| `CAMUNDA_HUB_SERVER_HTTPSONLY` | [optional]Enforce the usage of HTTPS when users access Camunda Hub (by redirecting from `http://` to `https://`).                                        | `true`                                                   | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
