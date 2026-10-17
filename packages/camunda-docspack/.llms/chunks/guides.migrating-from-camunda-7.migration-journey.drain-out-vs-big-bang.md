# Migration journey — Drain out vs big bang

There are two possible migration scenarios: Drain out and big bang.

![A diagram showing drain out vs big-bang migration scenarios](../img/drain-out-vs-big-bang.png)

Both are valid approaches. Let's briefly look at the differences.

- **Drain out**: Keep running the C7-based solution, but run the C8-based (migrated) solution in parallel. New process instances are started in the new one. After some time, no processes are active in Camunda 7 any more, and the C7-based solution can be decommissioned.

- **Big bang**: The solution is migrated from Camunda 7 to Camunda 8, including data migration scripts. At one moment in time, the C7-based solution is stopped, the data is migrated, and the new C8-based solution is started. This Camunda 7 solution can be decommissioned right after. Note that a big bang relates to **one process solution only**. So if you run multiple processes, you typically migrate them one by one in multiple big bangs, not in one super big bang. For any of those processes, when you migrate, you flip the switch and are on Camunda 8 for those processes.

Let's look at the pros and cons of each approach.

<!-- TODO strategies as deep links -->

**Drain out**

![A diagram showing the drain out scenario](../img/drain-out.png)

Pros:

- No downtime.
- No data migration required.
- Easy fallback to old solution in case of problems.

<!-- TODO "No data migration required" is too generic, go into details (no process data migration required) -->

Cons:

- Requires code switch (for example, forwarding messages to either Camunda 7 or Camunda 8 depending on where the corresponding process was started).
- Duplicate tooling (for example, one Tasklist for Camunda 7 and one for Camunda 8 processes; same for operators with Cockpit and Optimize).
- Need to operate two solutions at the same time.

**Big bang**

![A diagram showing the big-bang scenario](../img/big-bang.png)

Pros:

- Only one solution is running.
- No code switches necessary.
- No need to support the legacy codebase.

Cons:

- Requires data migration, at least runtime instances, which has some limitations (see [migration tooling](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index)).
- Complexity of the necessary data migration might drive effort.
- Might require downtime.

<!-- TODO mention that we are building a process instance migration tool -->

There are some scenarios where process instances are short-lived, and the big bang approach can simply drain out existing instances and then restart without the need for data migration, making migration simpler.

**Recommendation**

There is no general recommendation for which strategy to use.

You could consider the **big bang approach less complex** in many scenarios. However, there are some **indicators to use drain out** instead:

- **Short-lived processes**: If processes finish quickly, the drain out happens fast, and it might even be possible to delay new process starts until after the drain out has happened.
- **Latency-sensitive processes**: Some use cases can't stand the outage time required for data migration. Maybe you can delay data migration and do it after you have already switched to the C8-based solution. Otherwise, big bang might simply not be feasible or require a more sophisticated data migration strategy.
- **Risk**: If your use case carries a lot of risk, you might not feel comfortable with the big bang. Most often, this can be mitigated by properly testing your migration.
- **No switching logic required**: Maybe running the C8-based solution in parallel requires almost no effort on your end (as you don't have user tasks or message receive events), then it might be the simpler choice.
- **Complexity of data migration**: If data migration turns out to be complex in your solution, draining out might be the better choice.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
