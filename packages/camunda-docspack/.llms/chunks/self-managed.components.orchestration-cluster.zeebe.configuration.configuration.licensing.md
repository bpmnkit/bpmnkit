# Configuration — Licensing

See the [core settings documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/licensing).


## Logging

Zeebe uses Log4j2 framework for logging. In the distribution and the Docker image, find the default log configuration file in `config/log4j2.xml`.

### Google Stackdriver (JSON) logging

To enable Google Stackdriver compatible JSON logging, set the environment variable `ZEEBE_LOG_APPENDER=Stackdriver` before starting Zeebe.

### Change log level dynamically

Zeebe brokers expose a [Spring Boot Actuators web endpoint](https://docs.spring.io/spring-boot/docs/current/actuator-api/html/#loggers)
for configuring loggers dynamically.
To change the log level of a logger, make a `POST` request to the `/actuator/loggers/{logger.name}` endpoint as shown in the example below.
Change `io.camunda.zeebe` to the required logger name and `debug` to required log level.

```
curl 'http://localhost:9600/actuator/loggers/io.camunda.zeebe' -i -X POST -H 'Content-Type: application/json' -d '{"configuredLevel":"debug"}'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration
