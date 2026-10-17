# Camunda 8 public API

Learn what’s included in Camunda 8's public API and its stability guarantees under Semantic Versioning (SemVer), API changes and versioning policies, and what to expect when upgrading.


## What is the public API?

Camunda 8 follows [Semantic Versioning (SemVer)](https://semver.org/) to provide users with a stable and reliable platform. A key requirement of SemVer is a clearly defined public API.

The public API is the official contract between Camunda and its users under SemVer. No breaking changes will be made to the public API in minor or patch releases. You can safely build on these interfaces with the expectation of stability and backward compatibility.

- This is a subset of all available APIs. Many [APIs](https://docs.camunda.io/docs/next/apis-tools/working-with-apis-tools) are public-facing but not covered by the SemVer stability contract.
- Only components explicitly listed on this page (see [Included in the public API](#included-in-the-public-api)) are covered. Anything not listed is _not_ guaranteed under SemVer.
- The public API contract begins with version 8.8.

**Note**
The term "public API" refers to the SemVer definition of stable interfaces, not external APIs available to users.

### Included in the public API

The following components are officially part of the Camunda 8 public API:

- [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview): The primary interface for interacting with the Orchestration Cluster.
- [Camunda Process Test](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started): Testing library to test BPMN processes and process applications.
- [Camunda Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started): Java Client to interact with Orchestration Cluster REST API and Zeebe gRPC.
- [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started): Spring Boot Client to interact with Orchestration Cluster REST API and Zeebe gRPC.

---
Source: https://docs.camunda.io/docs/next/reference/public-api
