# Migrate to Camunda Spring Boot Starter — Maven/Gradle dependencies

Replace the Zeebe Spring SDK dependency with the Camunda Spring Boot Starter dependency in your `pom.xml` or `build.gradle` file.

Maven:

```xml
<dependency>
    <groupId>io.camunda</groupId>
    <artifactId>camunda-spring-boot-starter</artifactId>
    <version>8.8.x</version>
</dependency>
```

Gradle:

```groovy
implementation 'io.camunda:camunda-spring-boot-starter:${8.8.x}'
```


## Deprecated classes and methods

Please refer to the [Camunda Java Client migration guide](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client) for details on deprecated classes and methods.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-spring-boot-starter
