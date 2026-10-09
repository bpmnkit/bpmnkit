# Property reference — Configuration of the `restapi` component — Monitoring and health probes {#monitoring}

The `restapi` component is a Spring Boot application that includes the [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready), providing health check and metrics endpoints out of the box.
These endpoints are served on a separate management port (default: `8091`).

By default, Camunda Hub uses the following actuator configuration:

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
