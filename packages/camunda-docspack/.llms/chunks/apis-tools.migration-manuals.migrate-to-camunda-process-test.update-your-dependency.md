# Migrate to Camunda Process Test — Update your dependency

First, update your Maven dependency.

- **If you use ZPT with Camunda Spring Boot Starter integration**  
  (`artifactId: spring-boot-starter-camunda-test` or `spring-boot-starter-camunda-test-testcontainer`),  
  replace it with **CPT’s Spring integration module**.

- **If you use ZPT without Spring**  
  (`artifactId: zeebe-process-test-extension` or `zeebe-process-test-extension-testcontainer`),  
  replace it with **CPT’s Java module**.

In your Maven `pom.xml`, add the dependency:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-process-test-spring</artifactId>
  <scope>test</scope>
</dependency>
```

In your Maven `pom.xml`, add the dependency:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-process-test-java</artifactId>
  <scope>test</scope>
</dependency>
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
