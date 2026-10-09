# Migrate to Camunda user tasks — Troubleshooting and common issues

If your task application does not work properly after migration, check the following:

- **The endpoints return specific error messages when you run them on the wrong task type**: Ensure to call the right endpoint for the right task type, c.f. above [table](#use-the-new-camunda-8-api).
- **Forms do not appear**: Ensure you have extracted embedded forms, if any, and [transformed them into linked forms](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks#camunda-form-linked), before you change the task type implementation.
- **Task update operation does not work**: The update operation is only available to Camunda user tasks.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks
