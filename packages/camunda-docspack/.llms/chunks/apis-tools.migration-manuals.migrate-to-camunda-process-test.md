# Migrate to Camunda Process Test

Learn how to migrate from Zeebe Process Test to Camunda Process Test.

**Note: Have you already migrated?**
You do not need to perform this migration again if you already did this when upgrading to version 8.8. This guide is retained to help customers migrate before upgrading from 8.9 to 8.10. See [API and SDK changes to migrate before Camunda 8.10](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810#api-and-sdk-changes-to-migrate-before-camunda-810).


## About

[Camunda Process Test](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started) (CPT) is a library to test your BPMN processes and your projects.

- It is the successor to Zeebe Process Test (ZPT).
- Starting with version **8.8**, ZPT is deprecated and was removed in version **8.10**. See [release announcement](https://camunda.com/blog/2025/04/camunda-process-test-the-next-generation-testing-library/).

This guide walks you through migrating your existing test cases from ZPT to CPT step-by-step.

### Key differences

There are key differences between ZPT and CPT in both API and behavior, which may increase migration effort depending on your existing test cases.

| Aspect                       | Zeebe Process Test (ZPT)                                                        | Camunda Process Test (CPT)                                                                            |
| :--------------------------- | :------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------- |
| **Underlying engine**        | Uses only Camunda's workflow engine (Zeebe) with access to internal components. | Runs the full Camunda distribution and interacts with the Orchestration Cluster API.                  |
| **Assertions and utilities** | Uses specific naming conventions.                                               | Uses different names to align with the API; not all ZPT assertions/utilities have equivalents in CPT. |
| **Startup time**             | Faster startup.                                                                 | Takes longer to start as it runs the full Orchestration Cluster distribution.                         |

### Key advantages of CPT

- Access to Camunda’s Orchestration Cluster API and Connectors
- Support for Camunda user tasks
- Blocking assertions for asynchronous processing
- Enhanced mocking utilities

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
