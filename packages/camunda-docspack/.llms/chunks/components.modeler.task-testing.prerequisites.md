# Task testing — Prerequisites

- A connection to an active Camunda 8.8 or later orchestration cluster.
- Appropriate credentials and permissions to deploy and run processes.

After running a test, you can view the resulting process instance in [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) for additional insights into execution details or incidents. Test instances are deployed as standard process instances and can be viewed, managed, or deleted as usual.

For configuration steps, see:

- [Test in Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/task-testing)
- [Test in Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/task-testing)


## Supported elements

You can test the following BPMN elements:

- **Task elements** — service tasks, script tasks, user tasks, business rule tasks, and send tasks.
- **Sub-processes** — embedded sub-processes can be tested directly, executing all contained elements.
- **Tasks inside sub-processes** — individual tasks within a sub-process can also be tested.
- **Call activities** — call activities can be tested directly, executing the deployed called process.

The following elements are not supported:

- Events (start, end, boundary)
- Gateways

---
Source: https://docs.camunda.io/docs/next/components/modeler/task-testing
