# History — Forms

The History Data Migrator automatically migrates [Camunda Forms](https://docs.camunda.org/manual/latest/user-guide/task-forms/#camunda-forms) from Camunda 7 to Camunda 8. This includes forms linked to process definitions (start forms) and user tasks.

The form schema (JSON definition) is extracted from the Camunda 7 deployment resources and migrated to Camunda 8. The form structure, fields, and validation rules are preserved during migration.

User tasks that reference non-existent forms will be migrated as well.

### Form linking

The migrator automatically detects and links forms configured using `camunda:formRef` with a `camunda:formKey`. This applies to both start events and user tasks.

For each form reference, the migrator:

1. Resolves the form definition based on the form key and binding (deployment, latest, or version).
2. Links the element (process definition or user task) to the migrated form in Camunda 8.

Example BPMN configurations that will be migrated:

```xml
<!-- Start form -->
<bpmn:startEvent id="StartEvent_1">
  <bpmn:extensionElements>
    <camunda:formData>
      <camunda:formRef formKey="myStartForm" binding="deployment" />
    </camunda:formData>
  </bpmn:extensionElements>
</bpmn:startEvent>

<!-- User task form -->
<bpmn:userTask id="UserTask_1" name="Review Document">
  <bpmn:extensionElements>
    <camunda:formData>
      <camunda:formRef formKey="reviewForm" binding="deployment" />
    </camunda:formData>
  </bpmn:extensionElements>
</bpmn:userTask>
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
