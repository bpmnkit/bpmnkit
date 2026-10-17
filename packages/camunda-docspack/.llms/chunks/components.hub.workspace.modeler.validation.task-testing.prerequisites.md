# Task testing — Prerequisites

Before running task testing, ensure you have:

- A [runtime connection](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime) to an environment, hosted on an active Camunda 8.8 or later Orchestration Cluster
- Permissions to deploy and run processes in the target environment


## Run a task test

To test a task in Camunda Hub:

1. In your BPMN diagram, click the task you want to test.
2. Open the **Details** panel on the right side of the modeling interface.
3. Select the **Test** tab.
4. Under **Input**, define the process variables in JSON format to simulate the process context.
   - Use the **Variables** panel to review available variables in your process.
   - Confirm that input mappings for your task are configured correctly.
   - Match variable names and types to those expected by the task.
   - Provide realistic sample data to reflect actual execution conditions.
5. Click **Run test** to execute the task.

Camunda Hub automatically deploys the process before running the test. The task executes on the environment or cluster selected in the **Runtime** selector, using your defined input data. To test against a different runtime, [change the runtime connection](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime#change-the-runtime-connection). If you're connected to a production runtime, the **Test** tab shows **You are connected to a production cluster** (or **production environment**), because running a task there uses production data and can cause real side effects.

During execution, the log displays each step in real time, including any states where the test is waiting for an external action to complete.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/task-testing
