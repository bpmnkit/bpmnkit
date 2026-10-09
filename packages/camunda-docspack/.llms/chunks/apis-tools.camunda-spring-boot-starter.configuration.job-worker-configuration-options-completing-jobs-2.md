# Configuration — Job worker configuration options — Completing jobs (2)

You can also control auto-completion in your configuration.

**Globally:**

```yaml
camunda:
  client:
    worker:
      defaults:
        auto-complete: false
```

**Per worker:**

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          auto-complete: false
```

Ideally, you **don't** use blocking behavior like `send().join()`, as this is a blocking call to wait for the issued command to be executed on the workflow engine. While this is very straightforward to use and produces easy-to-read code, blocking code is limited in terms of scalability.

This is why the worker sample above shows a different pattern (using `exceptionally`). Often, you might want to use the `whenComplete` callback:

```java
send().whenComplete((result, exception) -> {})
```

This registers a callback to be executed when the command on the workflow engine was executed or resulted in an exception. This allows for parallelism. This is discussed in more detail in [this blog post about writing good workers for Camunda 8](https://blog.bernd-ruecker.com/writing-good-workers-for-camunda-cloud-61d322cad862).

**Note**
When completing jobs programmatically, you must specify `autoComplete = false`. Otherwise, there is a race condition between your programmatic job completion and the Spring integration job completion, and this can lead to unpredictable results.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
