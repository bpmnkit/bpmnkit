# Upgrade Camunda components from 8.9 to 8.10 — env

| Web Modeler (8.9 and earlier)                | Camunda Hub (8.10)                       |
| -------------------------------------------- | ---------------------------------------- |
| `MARKETPLACE_ENABLED`                        | `CAMUNDA_HUB_FEATURE_MARKETPLACEENABLED` |
| `PLAY_ENABLED`                               | `CAMUNDA_HUB_FEATURE_TESTMODEENABLED`    |
| `RESTAPI_OAUTH2_TOKEN_ISSUER_BACKEND_URL`    | `CAMUNDA_IDENTITY_ISSUERBACKENDURL`      |
| `CAMUNDA_MODELER_OAUTH2_TOKEN_USERNAMECLAIM` | `CAMUNDA_IDENTITY_USERNAMECLAIM`         |
| `LOGGING_LEVEL_IO_CAMUNDA_MODELER`           | `LOGGING_LEVEL_IO_CAMUNDA_HUB`           |

For an exhaustive list of the new settings, refer to the [Camunda Hub property reference](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties).

#### Update the log file name

The log file name in the default Log4j2 configuration changed from `camunda-modeler.log` to `camunda-hub.log`. Logging to a file is still disabled by default, so this change only affects you if you enabled file logging in Web Modeler and use the default configuration.

If external tooling such as log shippers, monitoring, or rotation scripts depends on the log file name, update it to `camunda-hub.log`. For the full default configuration, see [Camunda Hub logging](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
