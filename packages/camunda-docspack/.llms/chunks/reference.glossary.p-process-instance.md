# Glossary — P — Process instance

A [process instance](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation) is an execution of a [process definition](#process-definition), uniquely identified by its **processInstanceKey**.  
Each instance represents one run of the process and carries metadata from its originating process definition (process ID, version, and processDefinitionKey).

A process instance can be active (currently running), completed, or terminated.

In runtime discussions, [_executing a process_](https://docs.camunda.io/docs/next/components/concepts/processes) may be used as shorthand for deploying a process definition and starting an instance.

A process can call another process via a [call activity](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities/call-activities), creating a hierarchy of related process instances: a [parent process instance](#parent-process-instance) that contains the call activity, the [child process instance](#child-process-instance) it creates, and the [root process instance](#root-process-instance) at the top of the hierarchy.

---
Source: https://docs.camunda.io/docs/next/reference/glossary
