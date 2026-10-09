# Migration journey — Prepare your Camunda 7 solution (optional)

It can make sense to do a first refactoring step in your Camunda 7 codebase to prepare for easier migration. The advantage of this approach is that you can make changes in a codebase and environment you understand well, while you can still run existing test cases without changes, derisking any changes you make.

Typical preparation steps include:

- **Extract complex code from your JavaDelegates** into Camunda-independent classes (for example, Spring beans) that are then invoked from the original JavaDelegate. This way, you do a step towards [Clean Delegates](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-readiness) that will be easy to refactor.

- **Remove the usage of internal APIs** or calls that depend on the transactionally integrated architecture of Camunda 7 (for example, querying the HistoryService within a JavaDelgate and expect it to know current changes already).

- **Increase test coverage** of the solution to increase confidence that code conversions during migration do not break anything. This is especially important if your C7-based solutions lack good test coverage. To avoid migration effort on test cases, ideally **abstract the test cases from the Camunda version** used, either by using a small own abstraction layer, or by using a test framework such as [Cucumber](https://cucumber.io/) or [Sentinel](https://developer.hashicorp.com/sentinel/docs/intro).

<!-- TODO: Mention Scenario Tests -->

- **Structural changes in your BPMN model** to make them runnable on Camunda 8. One trigger could be that you are using constructs that are not supported in Camunda 8 (for example, execution listeners on sequence flows). Or you want to get your models into a state that allows runtime data migration (see [data migration](#migrate-data-optional)), for example by adding artificial wait states before multi-instance tasks (as multiple instance is not supported for runtime data migration).

- **Replace JUEL expressions with FEEL**. JUEL is not supported in Camunda 8 (see [conceptual differences](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences)). We [plan to release a FEEL plugin for the Camunda 7 platform](https://github.com/camunda/camunda-bpm-platform/issues/2384), allowing you to already rewrite your expressions within your Camunda 7 environment. This change goes beyond simply converting JUEL to FEEL, but also removing any calls to Spring beans that are not possible in FEEL. So you might, for example, add execution listeners invoking the code you need, writing a process variable that then can be evaluated in FEEL.

This step is optional and can also be skipped, either because the codebase is already in a clean state or you are feeling confident about directly converting your codebase to Camunda 8.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
