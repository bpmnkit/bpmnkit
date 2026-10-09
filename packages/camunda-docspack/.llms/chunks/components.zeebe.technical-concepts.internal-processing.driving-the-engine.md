# Internal processing — Driving the engine

As a workflow engine, Zeebe must continuously drive the execution of its processes. Zeebe achieves this by also writing follow-up commands to the stream as part of the processing of other commands.

For example, when the **Complete Job** command is processed, it does not just complete the job; it also writes the **Complete Activity** command for the corresponding service task.
This command can in turn be processed, completing the service task and driving the execution of the process instance to the next step.


## Unexpected error handling

When the workflow engine encounters an unexpected error while processing a command, it rejects the command.
If the command is related to a process instance, it additionally publishes an error event, applying it to the state machine.
As a result, the process instance is banned from the workflow engine, while it's data remains accessible.

### Banned process instance

Banning the process instance is a safety mechanism to safeguard against incorrect execution of the process and to prevent a single error from jamming the entire partition's stream processor.

- A banned process instance will not continue to execute.
- A banned process instance cannot be recovered.
- You can still cancel a banned process instance.

Internally, the workflow engine skips commands that are applicable to executing a banned process instance.
Commands related to canceling a banned process instance are not skipped.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing
