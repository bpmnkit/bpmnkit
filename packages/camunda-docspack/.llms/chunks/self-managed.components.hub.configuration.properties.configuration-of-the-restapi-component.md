# Property reference — Configuration of the `restapi` component

As a Spring Boot application, the `restapi` component supports any standard [Spring configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html) method.

The tables below list each setting in two formats:

- **Application properties** – the property names used in `application.yml`, the native Spring Boot configuration file format.
- **Environment variables** – suitable for Docker Compose or direct shell usage.

**Tip: Passing JVM options**
When running the `restapi` component in a container (Docker / Kubernetes), use the `JAVA_TOOL_OPTIONS` environment variable to pass JVM arguments, for example for trust store settings or proxy configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
