# Configuration — Job worker configuration options — Further job worker configuration options (2)

The `@JobWorker` annotation has no attribute to bind a worker to one named client. In a [multi-client](#multi-client-configuration-physical-tenants) application, every `@JobWorker` method registers against **all** configured clients — it fans out across the whole `CamundaClientRegistry`, not just the primary or default one.

In an application with only one client, this has no visible effect — there's only one client to fan out to.

Per-client worker overrides don't restrict this fan-out either: `worker.*`/`worker.override.*` properties set under `camunda.clients.<name>` have no effect, since the customizer that applies those overrides is built from the single, global `camunda.client.*` properties bean. Setting `camunda.clients.risk.worker.override.shipOrder.enabled: false`, for example, silently does nothing.

If you need a worker to run against only some of your configured Physical Tenants, filter inside the handler using the tenant identifier available to you at runtime, rather than relying on annotation-level scoping or per-client worker configuration.

#### Define the job timeout

To define the job timeout, you can set the annotation (`long` in milliseconds):

```java
@JobWorker(timeout=60000)
public void processOrder() {
  // worker's code
}
```

Moreover, you can override the timeout for the worker (as ISO 8601 duration expression):

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          timeout: PT1M
```

You can also set a global default:

```yaml
camunda:
  client:
    worker:
      defaults:
        timeout: PT1M
```

#### Configure the retry backoff

If you want to apply a retry backoff that should be applied if a job fails without a job error, you can set the annotation (`long` in milliseconds):

```java
@JobWorker(retryBackoff=10000L)
public void processOrder() {
  // worker's code
}
```

Moreover, you can override the retry backoff for the worker (as ISO 8601 duration expression):

```yaml
camunda:
  client:
    worker:
      override:
        processOrder:
          retry-backoff: PT10S
```

You can also set a global default:

```yaml
camunda:
  client:
    worker:
      defaults:
        retry-backoff: PT10S
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
