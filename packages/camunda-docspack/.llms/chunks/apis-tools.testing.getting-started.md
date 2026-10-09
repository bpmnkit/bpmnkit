# Camunda Process Test

Use the Camunda Process Test (CPT) Java library to test your BPMN processes and process applications.


## About

[Camunda Process Test](https://github.com/camunda/camunda/tree/main/testing/camunda-process-test-java) (CPT) is a Java library to test your BPMN processes and your process application.

CPT provides different runtimes to execute your process tests:

- [Testcontainers runtime](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#testcontainers-runtime) (default) - A managed runtime based on [Testcontainers](https://java.testcontainers.org/) and Docker.
- [Remote runtime](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#remote-runtime) - Your own runtime, such as, [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run)

**Info: Public API**
CPT is part of the Camunda 8 [public API](https://docs.camunda.io/docs/next/reference/public-api) and is covered by our SemVer stability guarantees (except for alpha features). Breaking changes will not be introduced in minor or patch releases.

**Note**
CPT is the successor to Zeebe Process Test (ZPT). Our previous testing
library was removed in Camunda 8.10. See
the [migration guide](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test) on how to migrate your process
tests.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/getting-started
