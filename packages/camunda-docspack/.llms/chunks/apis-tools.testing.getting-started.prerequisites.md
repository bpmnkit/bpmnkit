# Camunda Process Test — Prerequisites

- Java:
  - For the Camunda Java client: 8+
  - For the Camunda Spring Boot Starter: 17+
- [JUnit 5](https://junit.org/junit5/)

For the default [Testcontainers runtime](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#testcontainers-runtime):

- A Docker-API compatible container runtime, such as Docker on Linux or Docker Desktop on Mac and Windows.


## Install

CPT has two variants:

- For the [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started)
- For the [Camunda Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started)

Choose the one depending on which library you use in your process application.

Add the following dependency to your Maven project:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-process-test-spring</artifactId>
  <version>${camunda.version}</version>
  <scope>test</scope>
</dependency>
```

### Spring Boot 3 support

If you use the [dedicated Spring Boot 3 starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started#dedicated-spring-boot-3-and-4-modules) (`camunda-spring-boot-3-starter`),
you must also use the dedicated Spring Boot 3 test artifact:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-process-test-spring-boot-3</artifactId>
  <version>${camunda.version}</version>
  <scope>test</scope>
</dependency>
```

Add the following dependency to your Maven project:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-process-test-java</artifactId>
  <version>${camunda.version}</version>
  <scope>test</scope>
</dependency>
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/getting-started
