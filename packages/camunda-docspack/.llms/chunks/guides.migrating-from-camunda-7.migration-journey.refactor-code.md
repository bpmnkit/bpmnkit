# Migration journey — Refactor code

You need to refactor your code to use Orchestration Cluster APIs only.

Most prominently you need to **convert any API calls to Camunda** (for example, RuntimeService) and the glue code attached to process models (for example, JavaDelegates). The [code conversion patterns](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion) goes into more details how to approach this. Some of those changes might be automated using [OpenRewrite recipes](https://docs.openrewrite.org/).

Depending on your architecture you might also have to **re-architect** core parts of your solution. This is especially true if you rely on transaction integration, threading, internal API (such as calling the HistoryService from within a JavaDelegate), or features that are deprecated and thus are not planned for Camunda 8 (such as CMMN). See [conceptual differences between Camunda 7 and Camunda 8](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences) for more details on this.

<!--TODO: Add list features that are not planned -->

<!--TODO!!! -->

As part of this effort you also have to **adjust your test cases**. If you used [camunda-bpm-assert](https://github.com/camunda/camunda-bpm-platform/tree/master/test-utils/assert), a natural choice is to migrate to [Camunda Process Test](https://github.com/camunda/camunda/tree/main/testing/camunda-process-test-java). You can also leverage [code conversion patterns](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion) or [OpenRewrite recipes](https://docs.openrewrite.org/). If you use other means of testing (such as Cucumber, camunda-bpm-scenario, and so on) you must adjust accordingly.

The [Code Migration Detector](https://github.com/camunda-community-hub/camunda-7-to-8-migration/tree/main/code-migration-detector) (based on ArchUnit) can check how much Camunda 7 API is used in your codebase to allow you refactor to reduce the footprint step-by-step. Ideally, you can remove any Camunda 7 dependency at the end of your refactoring.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
