# Configuration — Job worker configuration options — Job type

By default, the **method name** is used as the job type, keeping your code self-documenting without additional configuration:

```java
@JobWorker
public void checkPayment() {
  // handles jobs of type 'checkPayment'
}
```

To use a different job type, set the `type` attribute on the annotation:

```java
@JobWorker(type = "payment-check")
public void checkPayment() {
  // handles jobs of type 'payment-check'
}
```

To override the job type externally without modifying the code — for example, when deploying a shared worker implementation under a different type name — use an application property:

```yaml
camunda:
  client:
    worker:
      override:
        checkPayment:
          type: payment-check
```

To set a fallback job type for all workers that don't define a type via annotation or property override:

```yaml
camunda:
  client:
    worker:
      defaults:
        type: my-default-type
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
