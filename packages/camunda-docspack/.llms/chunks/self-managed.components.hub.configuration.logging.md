# Logging

Read details on additional logging configuration for Camunda Hub.


## Logging configuration for the `restapi` component

Camunda Hub's `restapi` component uses [Apache Log4j 2](https://logging.apache.org/log4j/2.x/) for logging. By default, the
`restapi` component logs to the Docker container's standard output. To change the default logging behavior, create a
custom configuration file and let the `restapi` know of it by specifying the following environment variable:

```properties
LOGGING_CONFIG=file:/full/path/to/custom-log4j2-spring.xml
```

Refer to [Spring Boot's logging documentation](https://docs.spring.io/spring-boot/how-to/logging.html#howto.logging.log4j)
for more information on how to customize the `log4j2` configuration for specific use cases, such as logging to a file.

Enabling `DEBUG` logging for the `restapi` component can be useful for troubleshooting purposes, e.g. for
[debugging Zeebe connection issues](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection#how-can-i-debug-log-grpc--zeebe-communication).

By default, Camunda Hub's `restapi` component logs in a simple, readable format to the console.

You can configure log levels, output formats, and appenders, and adjust logging dynamically at runtime.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging
