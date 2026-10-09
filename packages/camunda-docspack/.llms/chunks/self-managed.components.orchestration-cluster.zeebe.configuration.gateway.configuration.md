# Gateway configuration — Configuration

The following sections describe Zeebe Gateway configuration options.

Each section includes a table with:

- Environment variables
- Application properties
- A description
- Default values

The configuration name appears as the section header. Table fields show the property used to set the configuration.

For deployments, environment variables are typically easier to use. Table entries use the standalone prefix (`ZEEBE_GATEWAY_*`). Because the embedded gateway is the default, replace this prefix with `ZEEBE_BROKER_GATEWAY_*` unless you run a standalone gateway.

If you deploy Camunda 8 with Helm (the recommended approach), the gateway runs embedded in the Orchestration Cluster and you configure it through the [global and orchestration cluster parameters](https://docs.camunda.io/docs/next/self-managed/deployment/helm/chart-parameters#global-and-orchestration-cluster-configuration) of the chart.

**Note**
The Zeebe Gateway is a Spring Boot application.

In addition to the configuration options documented here, you can use standard Spring Boot properties. For example, the REST server can be configured using `server.*` properties, and the management server (for actuator endpoints) using `management.server.*`.

See the [Spring Boot application properties reference](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
