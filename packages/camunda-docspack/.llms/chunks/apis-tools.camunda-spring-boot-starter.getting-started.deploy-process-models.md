# Camunda Spring Boot Starter — Deploy process models

To deploy process models on application start-up, use the `@Deployment` annotation:

```java
@SpringBootApplication
@Deployment(resources = "classpath:demoProcess.bpmn")
public class MySpringBootApplication {
```

To learn about all options about the usage of the `@Deployment` annotation, check out the [configuration](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration#deploying-resources-on-start-up) page.

**Need help?**

- [Camunda Community Forum](https://forum.camunda.io/) – Get help from the community.
- [GitHub repository](https://github.com/camunda/camunda) – Report issues and contribute.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started
