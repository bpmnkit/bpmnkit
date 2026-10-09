# Property reference

Read details on the configuration variables of Camunda Hub Self-Managed.

Camunda Hub Self-Managed consists of two components: [`restapi`](#configuration-of-the-restapi-component) and [`websocket`](#configuration-of-the-websocket-component).
Each component is configured separately as described below.

- The `restapi` component is a Spring Boot application. Its configuration is stored in a YAML file (`application.yml`) by default. All Camunda Hub-specific settings are prefixed with `camunda.hub`.
- The `websocket` (PHP/Laravel) component is configured via environment variables.

**Note: Configuration methods**
The two components support configuration through environment variables.
For the `restapi` component, environment variables can be used as an alternative to `application.yml` following [Spring Boot conventions](https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables): convert the property to uppercase, remove any dashes, and replace any delimiters (`.`) with `_`.

For example, the property `camunda.hub.clusters[0].name` is represented by the environment variable `CAMUNDA_HUB_CLUSTERS_0_NAME`.

If you are using the Camunda 8 Helm chart, read more about the different configuration options in the chart's [Helm chart values documentation](https://artifacthub.io/packages/helm/camunda/camunda-platform#webmodeler-parameters).
You can pass environment variables to each component via `camundaHub.restapi.env` and `camundaHub.websocket.env` in your `values.yaml`.

For which settings belong in the chart and which belong here, see [Helm and application configuration responsibilities](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities). The recommended path for the properties on this page is `camundaHub.restapi.extraConfiguration`.

For a working example configuration showing how the components are correctly wired together, see the [Docker Compose file for Camunda Hub](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
