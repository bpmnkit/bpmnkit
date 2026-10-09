# Java client — What can you build with it? — Step 1: Add the dependency

Add the Camunda Java Client to your project:

**Maven:**

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-client-java</artifactId>
  <version>${camunda.version}</version>
</dependency>
```

**Gradle:**

```groovy
implementation 'io.camunda:camunda-client-java:${camunda.version}'
```

Use the latest version from [Maven Central](https://search.maven.org/artifact/io.camunda/camunda-client-java).

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started
