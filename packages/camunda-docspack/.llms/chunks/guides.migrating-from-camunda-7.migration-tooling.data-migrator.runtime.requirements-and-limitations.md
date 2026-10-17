# Runtime — Requirements and limitations

The following requirements and limitations apply:

<!-- TODO this is an important deep link - we need to create a headline here -->

- The Runtime Data Migrator needs to access the Camunda 7 database.
- The Runtime Data Migrator needs to access Orchestration Cluster APIs (which means you can also use it when running SaaS).
- You must be familiar with the Data Migrator [limitations](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations).

If you need to adjust your process models before migration, you can use [process version migration](https://docs.camunda.org/manual/latest/user-guide/process-engine/process-instance-migration/) in the Camunda 7 environment to migrate process instances to versions that are migratable to Camunda 8. One useful strategy is to define dedicated migration states where your process instances can accumulate. Another common strategy is to use [process instance modification](https://docs.camunda.org/manual/latest/user-guide/process-engine/process-instance-modification/) in the Camunda 7 environment to move out of states that are not migratable (for example, process instances within a multiple instance task).

<!-- TODO pile up: mention the job pause feature in Camunda 7 -->

To use the Runtime Data Migrator, every Camunda 8 process model must have:

- A process-level **None Start Event**, and
- An execution listener on that **None Start Event** with the type `migrator` (or a validated job type, see below).

Example:

```xml
<bpmn:startEvent id="StartEvent_1">
  <bpmn:extensionElements>
    <zeebe:executionListeners>
      <zeebe:executionListener eventType="end" type="migrator" />
    </zeebe:executionListeners>
  </bpmn:extensionElements>
</bpmn:startEvent>
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
