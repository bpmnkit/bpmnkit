# Camunda Spring Boot Starter

Use the Camunda Spring Boot Starter to integrate Camunda 8 APIs (gRPC and REST) into your Spring Boot project for orchestration, automation, and data processing.


## About

The Camunda Spring Boot Starter is the official way to integrate Camunda 8 APIs ([gRPC](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc) and [REST](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview)) into your Spring Boot project. You can use it to orchestrate microservices, manage human tasks, and interact with process data using idiomatic Spring Boot patterns.

**Info: Public API**
The Camunda Spring Boot Starter is part of the Camunda 8 [public API](https://docs.camunda.io/docs/next/reference/public-api) and follows [Semantic Versioning](https://semver.org/) (except for alpha features). Minor and patch releases will not introduce breaking changes.

**Info: Migration from Spring Zeebe SDK**
**The Camunda Spring Boot Starter replaces the Spring Zeebe SDK as of version 8.8.**

- Uses the new Camunda Java Client under the hood
- REST is the default protocol (gRPC is configurable)
- Spring Zeebe SDK will be **removed in version 8.10**
- **Migrate before upgrading to 8.10** to avoid breaking changes

See the [migration guide](https://docs.camunda.io/docs/next/reference/announcements-release-notes/880/880-announcements#camunda-java-client-and-camunda-spring-boot-starter) for details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started
