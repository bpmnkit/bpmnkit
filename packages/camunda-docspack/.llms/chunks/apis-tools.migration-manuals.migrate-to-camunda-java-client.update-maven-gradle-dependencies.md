# Migrate to the Camunda Java Client — Update Maven/Gradle dependencies

Replace the Zeebe Java Client dependency with the Camunda Java Client dependency in your `pom.xml` or `build.gradle` file.

Maven:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-client-java</artifactId>
  <version>${camunda.version}</version>
</dependency>
```

Gradle:

```groovy
implementation 'io.camunda:camunda-client-java:${camunda.version}'
```


## Update imports

Update all imports statement in your Java files to use the new Camunda Java Client package structure.

Change from:

```java
import io.camunda.zeebe.client.*;
```

to:

```java
import io.camunda.client.*;
```


## Configuration and environment variable changes

- All old Java client property names are refactored to more general ones. For example, `zeebe.client.tenantId` to `camunda.client.tenantId`.
- Environment variables are also updated accordingly. For example, `ZEEBE_CLIENT_TENANT_ID` to `CAMUNDA_CLIENT_TENANT_ID`.
- The former deprecated `gatewayAddress` property and `usePlainText` have been **removed and superseded by `restAddress` and `grpcAddress` which require explicit URI schemes** (for example, `http://` or `https://`).

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client
