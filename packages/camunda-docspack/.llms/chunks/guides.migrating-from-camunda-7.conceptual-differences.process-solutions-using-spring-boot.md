# Conceptual differences — Process solutions using Spring Boot

With Camunda 7, a frequented architecture to build a process solution (also known as process applications) is composed out of:

- Java
- Spring Boot
- Camunda Spring Boot Starter with embedded engine
- Glue code implemented in Java delegates (being Spring beans)

<!-- TODO Camunda Run as reference architecture? -->

This is visualized on the left-hand side of the following image. With Camunda 8, a comparable process solution would look like the right-hand side of the picture and leverage:

- Java
- Spring Boot
- [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started) (embedding the Zeebe client)
- Glue code implemented as workers (being Spring beans)

![Diagram showing the spring boot architecture](../img/architecture-spring-boot.png)

The difference is that the engine is no longer embedded. If you are interested in the reasons why Camunda switched our recommendation from embedded to remote workflow engines, refer to this blog post on [moving from embedded to remote workflow engines](https://blog.bernd-ruecker.com/moving-from-embedded-to-remote-workflow-engines-8472992cc371).

The packaging of a process solution is the same with Camunda 7 and Camunda 8. Your process solution is one Java application that consists of your BPMN and DMN models, as well as all glue code needed for connectivity or data transformation. The big difference is that the configuration of the workflow engine itself is not part of the Spring Boot application anymore.

![Process Solution Packaging](../img/process-solution-packaging.png)

<!-- TODO image quality of embedded bpmn model -->

**Note**
Process solution definition is taken from [Practical Process Automation](https://processautomationbook.com/).

You can find a complete Java Spring Boot example, showing the Camunda 7 process solution alongside the comparable Camunda 8 process solution in the [Camunda 7 to Camunda 8 migration example](https://github.com/camunda-community-hub/camunda-7-to-8-migration).

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
