# Runtime — Job type configuration — Externally Started Process Instances

New Camunda 8 process instances should not be started on models that still have the `migrator` execution listener. Follow the recommended [choreography](#choreography): complete the migration first, then remove the execution listener and redeploy before starting new process instances.

If a process instance is started externally (not by the Data Migrator) on a model with the `migrator` execution listener, the Data Migrator will activate the job but skip it because the `legacyId` variable is not present. The process instance will remain at the start event. After the job lock times out, the job becomes available for activation again. This does not cause errors or data corruption, but an externally started process instance will not progress until the execution listener is removed and the model is redeployed.

When using the advanced FEEL expression configuration `=if legacyId != null then "migrator" else "noop"`, externally started process instances will generate jobs with the type `noop` instead of `migrator`, so the Data Migrator will not activate them at all. However, to allow these process instances to proceed past the start event, you must implement a **noop job worker** that completes these jobs:

```java
@JobWorker(type = "noop")
public void handleNoopJobs(ActivatedJob job) {
    // Simply complete the job without any processing
    // This allows externally started process instances to continue normally
}
```

This approach ensures that:

- Process instances started by the Data Migrator are handled by the `migrator` job worker.
- Externally started process instances continue their normal execution flow through the `noop` job worker.
- Both types of instances can coexist in the same Camunda 8 environment.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
