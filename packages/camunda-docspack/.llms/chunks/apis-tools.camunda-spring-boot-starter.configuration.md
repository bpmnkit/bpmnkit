# Configuration

This page uses YAML examples to show configuration properties. Alternate methods to [externalize or override your configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html) are provided by Spring Boot, and can be applied without rebuilding your application (properties files, Java System properties, or environment variables).

**Note**
Configuration properties can be defined as environment variables using [Spring Boot conventions](https://docs.spring.io/spring-boot/reference/features/external-config.html#features.external-config.typesafe-configuration-properties.relaxed-binding.environment-variables). To define an environment variable, convert the configuration property to uppercase, remove any dashes `-`, and replace any delimiters `.` with underscore `_`.

For example, the property `camunda.client.worker.defaults.max-jobs-active` is represented by the environment variable `CAMUNDA_CLIENT_WORKER_DEFAULTS_MAXJOBSACTIVE`.

**Note**
For a full set of properties, head over to the [properties reference](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference)

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
