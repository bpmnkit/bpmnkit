# Task testing — How it works

When you test an element, the following occurs:

1. The modeler deploys the process to the connected Camunda 8.8+ orchestration cluster.
2. You define the process context by providing input variables.
3. The engine executes the selected element:
   - Input mappings are applied as configured.
   - The actual task logic (connector, script, or external task) is executed by the engine.
   - Output mappings are applied as configured.
4. The modeler displays the **Result** tab containing the execution log, process variables, and local variables, as well as any incidents or errors.

**Warning**
Testing executes elements with live data on the connected cluster. Any configured actions (emails, API calls, database updates, payments, etc.) will run as defined.

Do not use a production environment.

---
Source: https://docs.camunda.io/docs/next/components/modeler/task-testing
