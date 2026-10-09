# Utilities — Mock job workers

You can mock a job worker to simulate its behavior without invoking the actual worker. The mock handles all jobs of the given job type.

When to use it:

- Test the process in isolation from the actual job workers
- Simulate different outcomes of a job worker (success, BPMN error)
- Mock disabled job workers or Connectors

**Tip**
If you start the process application in your test case, you
should [disable the job workers](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration#disable-a-job-worker) to avoid interferences with
the mocks, for example, by setting the following configuration:

```java
@SpringBootTest(properties = {"camunda.client.worker.defaults.enabled=false"})
@CamundaSpringProcessTest
class MyProcessTest { .. }
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/utilities
