# Connect to a runtime — Configure the runtime connection in Self-Managed

In Self-Managed, the runtime connection is enabled by default. To turn it off, set `camunda.hub.feature.runtime-connection-enabled` (environment variable `CAMUNDA_HUB_FEATURE_RUNTIME_CONNECTION_ENABLED`) to `false`. See the [feature flags reference](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#feature-flags).

When the runtime connection is off, task testing keeps using its own cluster selection, and connector credentials aren't offered in the properties panel.

Offering connector credentials in the properties panel also requires [credentials](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index) to be enabled with `camunda.hub.feature.credentials-enabled` (environment variable `CAMUNDA_HUB_FEATURE_CREDENTIALS_ENABLED`). It's also enabled by default in Self-Managed.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime
