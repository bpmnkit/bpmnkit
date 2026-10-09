# Runtime — Job type configuration

By default, the job type is configured as `migrator`. The Diagram Converter adds an execution listener with this type to None Start Events, and the Data Migrator activates jobs matching this type. This works out of the box, and no additional configuration is needed.

The job type is relevant because during migration, the Data Migrator creates new Camunda 8 process instances with a `legacyId` variable linking them to their original Camunda 7 instances. It then activates all jobs with the execution listener type `migrator`. These jobs are only processed if `legacyId` is present. Process instances started directly on Camunda 8 are skipped. See [Externally Started Process Instances](#externally-started-process-instances) for details.

The migrator supports two job type configurations with fallback behavior:

- **`job-type`**: Used for actual job activation (default: `migrator`).
  - It is used for activating jobs in Camunda 8 and is required for the migrator to function correctly.
  - It must match the execution listener type defined on the start event in the BPMN model. If the BPMN execution listener is an expression that resolves to a type, then `validation-job-type` needs to be configured as well.

- **`validation-job-type`**: Used for validation purposes (optional).
  - Before starting a process instance in Camunda 8, the Data Migrator verifies that the job type is present in the BPMN. This ensures the process instance execution waits for the Data Migrator at the start event.
  - When `validation-job-type` is not defined, `job-type` is used for both validation and activation.
  - You can define a FEEL expression that provides different job types based on the process instance context.
  - It must match the execution listener type defined on the start event in the BPMN model.
  - Set to `DISABLED` to disable job type validation entirely. This is not recommended.

**Basic Configuration (default):**

```yaml
camunda.migrator:
  job-type: migrator # Used for both validation and activation
```

**Advanced: Separate Validation and Activation:**

If you need to use a FEEL expression for the execution listener type (for example, to differentiate between migrated and externally started instances), you can configure `validation-job-type` separately:

```yaml
camunda.migrator:
  job-type: migrator # Used for activation
  validation-job-type: '=if legacyId != null then "migrator" else "noop"' # Used for validation with FEEL expression
```

When using a FEEL expression in `validation-job-type`, you must also specify the same expression in the execution listener of your BPMN process start events:

```xml
<bpmn:startEvent id="StartEvent_1">
  <bpmn:extensionElements>
    <zeebe:executionListeners>
      <zeebe:executionListener eventType="end" type="=if legacyId != null then &quot;migrator&quot; else &quot;noop&quot;" />
    </zeebe:executionListeners>
  </bpmn:extensionElements>
</bpmn:startEvent>
```

**Note**
Use FEEL expressions only for validation, not for job activation, since during job activation, the FEEL expression is already evaluated to a static value.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/runtime
