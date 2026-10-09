# Conceptual differences — Programming model

The programming models of Camunda 7 and Camunda 8 are very similar if you program in Java and use Spring.

For example, a worker in Camunda 8 can be implemented as follows (using the [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started)):

```java
@JobWorker(type = "payment")
public void retrievePayment(ActivatedJob job) {
  // Do whatever you need to, for example invoke a remote service:
  String orderId = job.getVariablesMap().get("orderId");
  paymentRestClient.invoke(...);
}
```

**Info**

- You can find more information on the programming model in Camunda 8 in this blog post on [how to write glue code without Java Delegates in Camunda Cloud](https://blog.bernd-ruecker.com/how-to-write-glue-code-without-java-delegates-in-camunda-cloud-9ec0495d2ba5).
- Check out [code conversion patterns](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion) for more details.

<!--
**Note**
JUnit testing with an embedded in-memory engine is also possible with Camunda 8, see the [Camunda Spring Boot Starter documentation](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started).
-->

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
