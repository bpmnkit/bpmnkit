# Upgrade Camunda components from 8.9 to 8.10 — Migrate Web Modeler settings

Migrate your Camunda Hub configuration from the legacy Web Modeler settings to the new Hub equivalents.

No immediate action is required, as Camunda Hub still accepts the legacy Web Modeler properties in 8.10 and translates the recognized properties to their new equivalents at startup. Hub logs a warning that lists each legacy property it finds.
Support for the legacy settings will be removed in 8.12, so update your configuration ahead of that removal.

| Web Modeler (8.9 and earlier)                            | Camunda Hub (8.10)                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application properties prefixed with `camunda.modeler.*` | Replaced by `camunda.hub.*`                                                                                                                                                                                                                                                                  |
| Environment variables prefixed with `CAMUNDA_MODELER_*`  | Replaced by `CAMUNDA_HUB_*`                                                                                                                                                                                                                                                                  |
| Other environment variables                              | Replaced by environment variables strictly derived from the respective application property name (for example, `CAMUNDA_HUB_*` for Hub-owned properties, `SPRING_*` for Spring Boot properties). Hub no longer uses custom, non-matching environment variable names. See the examples below. |

Examples of the replacement rule for other environment variables:

- `OAUTH2_CLIENT_ID` to `CAMUNDA_HUB_OAUTH2_CLIENTID`
- `CLIENT_PUSHER_PATH` to `CAMUNDA_HUB_PUSHER_CLIENT_PATH`
- `RESTAPI_MAIL_USER` to `SPRING_MAIL_USERNAME`

In addition to the replacement rules above, the following properties were renamed or moved to a different property path:

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
