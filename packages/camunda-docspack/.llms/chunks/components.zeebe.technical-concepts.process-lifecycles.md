# Process lifecycles

In Zeebe, the process execution is represented internally by events of type ProcessInstance.

In Zeebe, the process execution is represented internally by events of type `ProcessInstance`. The events are written to the log stream and can be observed by an exporter.

Each event is one step in a process instance lifecycle. All events of one process instance have the same `processInstanceKey`.

Events which belong to the same element instance (e.g. a task) have the same `key`. The element instances have different lifecycles depending on the type of element.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/process-lifecycles
