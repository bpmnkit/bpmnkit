# Migration journey — Improve Camunda 8 solution (optional)

One optional step many customers are doing is to adjust their solution to the latest Camunda best practices after migration. This allows you to reduce technical debt or remove workarounds that either crept into the solution over time or during the migration project for going live quickly. This step does not have to block the rollout of your migrated solution, and is often done after the fact to remove time pressure and incorporate any learnings from operating the Camunda 8 solution.

While this step can happen during code conversion already, it might also make sense to do it in a separate later step to reduce the number of changes during conversion to reduce the risk of breaking things.

While technically it is a great thing to improve your solution, many migration projects are under pressure to run efficiently (read: minimal effort). Therefore it is advisable to at least separate two different goals:

- Migrate the solution
- Improve the solution and reduce further technical debt

While Camunda sees a lot of value in doing both tasks at the same time - as you touch a lot of the code anyway and will probably also retest your solution thoroughly - if the budget is tight it might be better to focus on migration instead of not getting budgeted for the increased scope.

**(5)**

With your solution code migrated, you also need to look at your production data. Camunda provides the **[Data Migrator](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/index)** to be used for this. You might need to customize the data migrator, especially if you used complex data formats in Camunda 7 (for example, Java objects) that need to be converted to something Camunda 8 can handle (for example, JSON). As part of this step you might also need to extract big payloads and binaries (such as documents) into an external data store and reference it from the process (using for example upcoming document handling possibilities).

Data to be migrated includes **runtime instances, audit data, and optimize data**. Let's look at it one by one.

![A diagram showing data migration](../img/data-migration.png)

**Runtime instances**

Currently running process instances. Running means that these process instances in Camunda 7 are not yet ended and currently wait in some [wait-state](https://docs.camunda.org/manual/latest/user-guide/process-engine/transactions-in-processes/#wait-states). This state is persisted in the database and a corresponding data entry needs to be created in Camunda 8, so that the process instance can continue from that state in the new solution.

Runtime instance migration has limitations, check [migration tooling](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index) for details. As a result you might need to adjust your process models before migration. You can use [process version migration](https://docs.camunda.org/manual/7.22/user-guide/process-engine/process-instance-migration/) in the Camunda 7 environment to migrate process instances to the version that is migratable to Camunda 8. An interesting strategy can be to define dedicated migration states you want your process instances to pile up in. Another common strategy is to use [process instance modification](https://docs.camunda.org/manual/7.22/user-guide/process-engine/process-instance-modification/) in the Camunda 7 environment to move out of states that are not migratable (for example, process instances within a multiple instance task).

<!-- TODO: Expand -->

Migrating runtime instances is only necessary if you target a big bang migration for your process solution (keep in mind that "big bang" in this context means to switch one process solution from Camunda 7 to Camunda 8 on a defined point in time - it doesn't mean that you have to migrate all your processes at once). If you drain out your Camunda 7 processes, or if they are typically very short-lived, you do not need runtime instance migration.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
