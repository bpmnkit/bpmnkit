# Migration journey — Leverage guidance, advisory, and tooling

This guide is the main resource walking you through migration.

As part of your migration journey, you might also want to consider engaging professional services to help you. The main starting points are:

- [Migration evaluation workshop (Camunda)](https://camunda.com/wp-content/uploads/2025/06/Camunda_ConsultingWorkshops_6-Migration-Evaluation_2025_EN.pdf)
- Scoping Workshop (Camunda) <!-- TODO -->
- Professional advisory services (Camunda, Partners)
- Implementation services (Partners)

Furthermore, you can use the [migration tooling](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index) and related resources.

**(2)**

To run any solution on Camunda 8, you must have a running Camunda 8 installation.

<!-- TODO mention that SaaS is also a "running installation" in that sense -->

If you used an embedded engine with Camunda 7 in the past, this model is no longer possible (see [conceptual differences between Camunda 7 and Camunda 8](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences)). This might be new to your organization to operate Camunda in addition to your solution itself. The most successful operating model is to have a central team in the organization caring about Camunda, offering it as a self-service platform to others. This is also described in our [process automation Center of Excellence playbook](https://camunda.com/process-orchestration/automation-center-of-excellence/).

**Note**
We want to unmask some typical misconceptions with Camunda 8:

- Camunda 8 does **not** need to be consumed as SaaS! But you can use SaaS if you want.
- Camunda 8 does **not** mean there needs to be one huge cluster to rule them all! But you can run big workloads on one cluster.
- Camunda 8 does **not** need to be set up for horizontal scalability! But you can set this up if you want.

You can run small Camunda 8 installations, one per solution, if you like. They can all be Self-Managed, meaning they run in your own datacenter. With the [architecture streamlining and the RDBMS initiative](https://camunda.com/blog/2024/04/simplified-deployment-options-accelerated-getting-started-experience/), Camunda provides a very simple Java installation (single JAR) that removes installation complexity and is sufficient for many use cases (RDBMS support for a secondary data store is available since Camunda 8.9).

There are multiple ways to set up Camunda 8:

- Use **Camunda's SaaS** offering: You don't need to install or operate the platform yourself. This is the most convenient and generally recommended option. If you face legal challenges around information security, privacy, and compliance, check the [Camunda Trust Center](https://camunda.com/trust-center/). However, be aware of the following limitations:
  - You cannot [migrate historical audit data from Camunda 7](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index).
  - [Multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) is not currently supported.

- Run the platform **Self-Managed**. You might want to look at the [Camunda 8 Run distribution](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run). RDBMS support is available since Camunda 8.9, removing the need for Elastic Search and allowing a relatively simple setup that Camunda 7 users often like. Still, you can go for more scalable options (see also the [architecture streamlining blog post](https://camunda.com/blog/2024/04/simplified-deployment-options-accelerated-getting-started-experience/)). Refer to [installation guides](https://docs.camunda.io/docs/next/self-managed/deployment/index) for details.

While setting up Camunda 8 is not part of the core migration journey, it is a prerequisite and should be tackled early in the migration journey to avoid blockers.

**(3)**

There are a small number of core decisions that will influence your overall migration journey. Although you might make them later in your journey once you have a better understanding of the consequences, Camunda presents them here so that you have them top of mind for the remainder of this guide.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
