# Limitations — Runtime — BPMN elements (2)

#### Call activity

To migrate a subprocess that is started from a call activity, the migrator must set the `legacyId` variable for the subprocess. This requires propagating the parent variables. This can be achieved by updating the Camunda 8 call activity in one of the following ways:

- Set `propagateAllParentVariables` to `true` (this is the default) in the `zeebe:calledElement` extension element.
- Or, if `propagateAllParentVariables` is set to `false`, provide an explicit input mapping:

```xml
<zeebe:ioMapping>
  <zeebe:input source="=legacyId" target="legacyId" />
</zeebe:ioMapping>
```

#### Multi-instance

Processes with active multi-instance elements can currently not be migrated. We recommend to finish the execution of any multi-instance elements prior to migration.

#### Parallel gateways

Process instances with active joining parallel gateways cannot currently be migrated. The migrator will skip these instances during migration.

- This limitation occurs when some execution paths have completed and reached the joining parallel gateway, but other paths are still waiting at activities before the gateway.
- Recommendation: Ensure no token waits in a joining parallel gateway.
- See https://github.com/camunda/camunda-bpm-platform/issues/5461

#### Timer events

- Timer start events: prior to migration, you must ensure that your process has at least one [none start event](https://docs.camunda.io/docs/next/components/modeler/bpmn/none-events/none-events#none-start-events). Processes that only have a timer start event cannot be migrated.
- If your model contains timer events (start and other), you must ensure that no timers fire during the migration process.
  - Timers with [date](https://docs.camunda.io/docs/next/components/modeler/bpmn/timer-events/timer-events#time-date): ensure the date lies outside the migration time frame.
  - Timers with [durations](https://docs.camunda.io/docs/next/components/modeler/bpmn/timer-events/timer-events#time-duration): ensure the duration is significantly longer than the migration time frame.
  - Timers with [cycles](https://docs.camunda.io/docs/next/components/modeler/bpmn/timer-events/timer-events#time-cycle)): ensure the cycle is significantly longer than the migration time frame and/or use a start time that lies outside the migration time frame.
- Note that during deployment and/or migration, the timers may be restarted. If business logic requires you to avoid resetting timer cycles/duration, you need to apply a workaround:
  - Timers with cycles:
    - Add a start time to your cycle definition that is equal to the moment in time when the currently running Camunda 7 timer is next due.
    - You must still ensure that the start time lies outside the migration time frame.
  - Timers with durations:
    - Non-interrupting timer boundary events:
      - Switch to cycle definition with a start time that is equal to the moment in time when the currently running Camunda 7 timer is next due and add a "repeat once" configuration.
      - This way, for the first post migration run, the timer will trigger at the start time.
      - For all subsequent runs, the defined cycle duration will trigger the timer. The "repeat once" instruction ensures it only fires once, similar to a duration timer.
      - You must still ensure that the start time lies outside the migration time frame.
    - Interrupting boundary and intermediate catching events:
      - Add a variable to your Camunda 7 instance that contains the leftover duration until the next timer is due.
      - In your Camunda 8 model, adjust the timer duration definition to use an expression: if the variable is set, the value of this variable should be used for the duration. If the variable is not set or does not exist, you may configure a default duration.
      - This way, for the first post migration run the variable will exist and the timer will set its duration accordingly.
      - For all subsequent runs, the variable will not exist and the default duration will be used.
      - Again, you must ensure the leftover duration for the first post migration run lies outside the migration time frame.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
