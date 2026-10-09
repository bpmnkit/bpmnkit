# Environment variables

Let's take a closer look at the environment variables for configuration, operators, and developers.


## Environment variables for configuration

As a Spring Boot application, Zeebe supports any standard
[Spring configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html) method. This configuration can be provided as a configuration file, through environment variables, or both. When both sources are used, environment variables have precedence over the configuration file.

All available environment variables are documented in the [configuration file templates](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration#configuration-file-templates).


## Environment variables for operators

The following environment variables are intended for operators:

- `ZEEBE_LOG_LEVEL`: Sets the log level of the Zeebe Logger (default: `info`).
- `ZEEBE_LOG_APPENDER`: Sets the console log appender (default: `Console`). We recommend using `Stackdriver` if Zeebe runs on Google Cloud Platform to output JSON formatted log messages.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/environment-variables
