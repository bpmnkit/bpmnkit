# Configuration — Job worker configuration options — Configuring the job worker thread pool

The number of threads for invocation of job workers (default 1):

```yaml
camunda:
  client:
    execution-threads: 2
```

**Note**
We generally do not advise using a thread pool for workers, but rather implement asynchronous code, see [writing good workers](https://docs.camunda.io/docs/next/components/best-practices/development/writing-good-workers) for additional details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
