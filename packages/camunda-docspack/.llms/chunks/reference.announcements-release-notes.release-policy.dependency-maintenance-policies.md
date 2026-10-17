# Release policy — Dependency maintenance policies

Camunda provides [a standard support policy](https://camunda.com/release-policy/) of 18 months for a particular minor version from the date it is released.
During this time, patches are regularly released containing security and bug fixes, some of which may come from dependency updates. Therefore, for the
vast majority of dependencies Camunda _only_ applies patch updates.

However, certain dependencies used by Camunda 8 may have a shorter maintenance policy than Camunda itself. Camunda may adopt a different update policy for these dependencies, as listed below.

### Spring Boot/Framework/Security updates

Spring has a [different maintenance window](https://spring.io/projects/spring-boot#support) than Camunda for its open-source software (OSS) offering.
Camunda addresses this with Spring Boot/Framework/Security update policies for the Camunda Orchestration Cluster and client libraries.

**Info**
The update policy covers the Spring Framework and Security versions, as well as [other dependencies managed via Spring Boot](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html).

#### Orchestration Cluster

The Camunda Orchestration Cluster leverages Spring Boot to implement core functionality, like application configuration, REST infrastructure (including security), and other production-ready features.

Camunda ensures that **the latest available patch releases make use of a Spring version within an active support window**. Therefore, Orchestration Cluster patch releases **may contain updates to newer Spring Boot minor versions**. In cases where a Spring major version's OSS support ends before Camunda's own support window, Camunda may utilize Spring enterprise support artifacts from a vendor determined on a case-by-case basis to ensure continued maintenance and security coverage for the Orchestration Cluster components.

#### Client libraries and SDKs

Camunda clients or SDKs, such as the [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started), that are meant to be included in third-party applications, may depend on a particular Spring Boot release.

To ensure backward compatibility, every Camunda library patch release references the same Spring Boot minor version as the one referenced in the Camunda library's latest minor release.

However, Camunda tests against newer Spring Boot minor releases and declares compatible versions in the library's compatibility matrix. For an example, refer to the [Camunda Spring Boot Starter Compatibility Matrix](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started#version-compatibility).

If the library is compatible with a newer Spring version with an active OSS support window, Camunda declares compatibility one month before the support window ends, at the latest.

With this policy, you can safely update your applications to a new Spring Boot version by overriding the default Spring release with another compatible version.

##### Spring Boot major versions

Camunda supports two Spring Boot major versions at a time:

- A numbered `camunda-spring-boot-{n}-starter` artifact is published for each supported major, so you can pin to a major and stay on it.
- The plain `camunda-spring-boot-starter` always follows the current default major.
- The previous major stays supported until the end of Spring Commercial support for that major, after which it receives no further updates.

When a new Spring Boot major version reaches GA, Camunda makes it the default artifact in the Camunda release that ships before OSS support for the previous major version ends.

---
Source: https://docs.camunda.io/docs/next/reference/announcements-release-notes/release-policy
