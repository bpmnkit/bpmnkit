# Camunda Spring Boot Starter — What you can build with it

With the Camunda Spring Boot Starter, you can build:

- **Job workers** that perform automated tasks and call external systems (APIs, databases, file systems)
- **Integration services** that connect Camunda processes with existing systems or third-party services
- **Data processing applications** that use process data for visualization, analytics, or business intelligence


## Version compatibility

| Camunda Spring Boot Starter artifact | Camunda Spring Boot Starter version | JDK  | Bundled Spring Boot version | Compatible Spring Boot version(s) |
| ------------------------------------ | ----------------------------------- | ---- | --------------------------- | --------------------------------- |
| `camunda-spring-boot-starter`        | 8.10.x                              | ≥ 17 | 4.1.x                       |                                   |
| `camunda-spring-boot-4-starter`      | 8.10.x                              | ≥ 17 | 4.1.x                       |                                   |
| `camunda-spring-boot-3-starter`      | 8.10.x                              | ≥ 17 | 3.5.x                       |                                   |

For Spring Boot OSS and Commercial support dates, see the [Spring Boot support timeline](https://spring.io/projects/spring-boot#support).

### Dedicated Spring Boot 3 and 4 modules

Starting with Camunda 8.10, the default `camunda-spring-boot-starter` artifact is bundled with **Spring Boot 4.1.x**. Additionally, two dedicated modules are available:

- **`camunda-spring-boot-4-starter`**: Identical to `camunda-spring-boot-starter`. Use this if you want to explicitly target Spring Boot 4.1.x.
- **`camunda-spring-boot-3-starter`**: Bundled with Spring Boot 3.5.x. Use this if your application is not yet ready to upgrade to Spring Boot 4.1.x.

**Caution: Spring Boot 3.5.x OSS support window**
Spring's open source support for Spring Boot 3.5.x ended in June 2026 (see [Spring Boot support timeline](https://spring.io/projects/spring-boot#support)). Camunda continues to support and maintain `camunda-spring-boot-3-starter` until the end of Spring Commercial support for Spring Boot 3.x.

What this means for your application:

- **Camunda's starter:** Camunda continues to release patches for `camunda-spring-boot-3-starter` until the end of Spring Commercial support.
- **Spring framework patches:** After June 2026, Spring will no longer provide open-source security or bug-fix patches for Spring Boot 3.x. Security patches remain available through Spring Commercial support (Broadcom).

For details on how Camunda handles major version transitions and end-of-support windows, see [Spring Boot/Framework/Security updates](https://docs.camunda.io/docs/next/reference/announcements-release-notes/release-policy#spring-bootframeworksecurity-updates).

To use the Spring Boot 3 module, replace the default dependency in your project:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-spring-boot-3-starter</artifactId>
  <version>8.9.x</version>
</dependency>
```

**Caution: Micrometer version requirement**
`camunda-spring-boot-3-starter` requires **Micrometer 1.16 or newer** if you enable Micrometer-based metrics. Spring Boot 3.5.x's own dependency management defaults to an older Micrometer version (~1.15.x), which does not satisfy this requirement.

If your application resolves a Micrometer version below 1.16 while metrics are enabled, job workers appear to activate jobs normally, but handler methods never run — jobs keep expiring and getting re-activated indefinitely, with no error in the logs.

To avoid this, explicitly pin Micrometer to 1.16 or newer:

**Maven**, import the Micrometer BOM as the first entry in `<dependencyManagement>`, before your Spring Boot BOM import (import order matters when two BOMs manage the same dependency):

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>io.micrometer</groupId>
      <artifactId>micrometer-bom</artifactId>
      <version>1.16.6</version>
      <scope>import</scope>
      <type>pom</type>
    </dependency>
    <!-- your Spring Boot BOM import goes after this -->
  </dependencies>
</dependencyManagement>
```

**Gradle**, add a constraint:

```groovy
dependencies {
  constraints {
    implementation("io.micrometer:micrometer-core:1.16.6")
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started
