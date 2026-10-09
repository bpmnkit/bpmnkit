# Migration journey — Define your target Camunda version for migration

Because of the improved core architecture of Camunda 8, features need to be re-added to Camunda 8 step-by-step. That means the current Camunda 8 version might not yet have sufficient feature parity for your scenario to migrate. Prominent examples are [task listeners](https://roadmap.camunda.com/c/147-user-task-listeners-for-assigning-and-completing-events), which will be introduced with 8.8.

<!-- TODO link to specific product board features -->

If your solution requires this feature, it might make sense to wait for the Camunda 8 version that will provide it. You can **[check the public feature roadmap](https://roadmap.camunda.com/) to understand timelines**.

The Camunda version to target might differ per process solution. For example, Process A might not need additional features and can migrate right away, but Process B might use the task listener planned for 8.8. That means you wait for rolling out migration for Process B till that version. As Camunda is currently running [an architecture streamlining initiative](https://camunda.com/blog/2024/04/simplified-deployment-options-accelerated-getting-started-experience/) to improve the core architecture, which [will be released with Camunda 8.8](https://camunda.com/blog/2025/01/camunda-87-88-release-update/). Unless you have time pressure or momentum to lose, Camunda generally recommends waiting for this to happen and targeting a Camunda version \>= 8.8 for migration.

![A diagram showing the targeted version](../img/target-version.png)

For example, targeting the 8.9 release doesn't mean you wait for it to happen before thinking about migration. Typically, you can already perform analysis (which you might need to do anyway to understand the right target version), which is also important to plan your project and apply for the required budget on time. Doing the migration tasks can also happen before the actual release, either independently or based on early alpha versions.

<!-- TODO highlight the paragraph -->

![A diagram showing the on-time targeted version](../img/starting-ontime.png)

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
