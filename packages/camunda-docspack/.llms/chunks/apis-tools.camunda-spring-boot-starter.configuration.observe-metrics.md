# Configuration — Observe metrics

The Camunda Spring Boot Starter provides some out-of-the-box metrics that can be leveraged via [Spring Actuator](https://docs.spring.io/spring-boot/docs/current/actuator-api/htmlsingle/). Whenever actuator is on the classpath, you can access the following metrics:

- `camunda.job.invocations`: Number of invocations of job workers (tagging the job type)

For all of those metrics, the following actions are recorded:

- `activated`: The job was activated and started to process an item.
- `completed`: The processing was completed successfully.
- `failed`: The processing failed with some exception.
- `bpmn-error`: The processing completed by throwing a BPMN error (which means there was no technical problem).

In a default setup, you can enable metrics to be served via http:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: metrics
```

Access them via [http://localhost:8080/actuator/metrics/](http://localhost:8080/actuator/metrics/).

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
