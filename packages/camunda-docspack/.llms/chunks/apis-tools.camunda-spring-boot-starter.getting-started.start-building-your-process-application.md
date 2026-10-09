# Camunda Spring Boot Starter — Start building your process application

With your project configured, you are ready to build your process application. Below are the core operations you'll typically perform, along with guidance on the next steps.

### Inject the Camunda client

You can inject the Camunda client and work with it to create new workflow instances, for example:

```java
@Autowired
private CamundaClient client;
```


## Implement the job worker

Declare a method on a bean. By default, the method name is used as the job type, so you only need the annotation:

```java
@JobWorker
public void processOrder() {
  // handles jobs of type 'processOrder'
}
```

To inject specific process variables as typed parameters, use `@Variable`:

```java
@JobWorker
public void processOrder(@Variable String orderId, @Variable BigDecimal amount) {
  // only 'orderId' and 'amount' are fetched; types are enforced automatically
}
```

To learn about all options you have with job workers, check out the [configuration](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration#job-worker-configuration-options) page.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started
