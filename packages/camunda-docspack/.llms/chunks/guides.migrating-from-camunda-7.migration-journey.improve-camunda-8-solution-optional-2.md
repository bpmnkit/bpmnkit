# Migration journey — Improve Camunda 8 solution (optional) (2)

The Data Migrator needs to access the Camunda 7 database, but just uses Orchestration Cluster APIs, which means you can also use this tool when you run on SaaS.

**Audit data (aka History)**

Process instances left traces, often referred to as "history data". These are audit logs when a process instance was started, what path it took, and so on.

It is important to note, that audit data can exist for ended processes from the past, but is also available for currently still running process instances, as those process instances also left traces up to the current wait state.

If you need to preserve audit data and want to transfer it to Camunda 8, you can also use the [Data Migrator](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index). Migrating audit **data comes with limitations** (most prominently that you need to run [Camunda 8 with **RDBMS**](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index), a feature introduced with 8.9).

<!-- TODO use a deep link here as well -->

Migrating audit data is optional. If you need to do it, consider that audit data migration might need to look at a huge amount of data, which can take time to migrate. But you can run audit data migration beside the normal operations after a successful big bang migration over a period of time, which helps you to keep downtimes low.

**Optimize data**

The process intelligence tool Optimize keeps a lot of audit data to allow various analysis. This data might also want to be migrated when switching to Camunda 8.

Optimize data migration **is currently not yet possible**, but this is planned on the roadmap.

<!-- TODO link to the roadmap item -->

**(6)**

After you migrated the solution and prepared and tested the data migration (if necessary) you need to roll out your changes.

- **Drain out**: In a drain out scenario you need to deploy your new solution next to the existing Camunda 7 solution. Then you need to add switching logic in your code, API gateway, or load balancer logic, which redirects traffic to your new solution. However, you still need to correlate callbacks to waiting process instances to the old solution, and might also present user tasks of both solutions to your users.

- **Big bang**: In a big bang scenario, you will typically shutdown the old solution (or at least parts of it for the process under migration), then run the runtime instance migration to make sure all waiting process instances are transferred to the Camunda 8 solution. After this step succeeded, you can start up the new solution and route traffic to it. This approach assumes there can be a downtime of the application. If that is not an option, another alternative is to startup the Camunda 8 solution in parallel and just switch the traffic routing without downtime, and then start to migrate runtime instances afterwards.

Audit data migration can run after the switch has happened, after a successful drain out (in parallel to normal operations) or of course during the downtime of a big bang. The best approach depends on the amount of data and the possibility for downtimes.

**(7)**

Once you have successfully big banged to Camunda 8, or all running processes are drained out, you can decommission your Camunda 7 solution. If this was the last Camunda 7 solution, you can completely decommission the Camunda Platform 7 and related practices.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
