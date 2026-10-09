# Broker configuration — Configuration

We provide tables with environment variables, application properties, a description, and corresponding default values in the following sections.

For Camunda 8.9+, use the unified `camunda.*` properties and corresponding `CAMUNDA_*` environment variables where they are documented on this page.

Configuration names are noted as the **header** of each documented section, while the **field** values represent properties to set the configuration.

**Note**
The Zeebe Broker is a Spring Boot application. As such, [many common Spring Boot properties will work out of the box](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html).

Additionally, its REST server is a Spring Boot server (powered by Spring MVC), and can be configured using the standard `server.*` properties. Its management server (for example, where actuator endpoints live) is configured as a child application context, and is also a Spring MVC server. It can be configured via `management.server.*` properties.

Finally, the REST server is only serving requests _if, and only if, the embedded gateway is enabled via_ `zeebe.broker.gateway.enable: true`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
