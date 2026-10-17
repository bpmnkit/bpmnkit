# Limitations — Runtime — BPMN elements

Some BPMN elements and configurations supported in Camunda 7 are not supported in Camunda 8 or have specific limitations during migration. Below is an overview of these limitations and recommendations to address them.

#### Elements supported in Camunda 7 but not supported in Camunda 8

Some BPMN elements available in Camunda 7 are not supported in Camunda 8. Before migration, compare the BPMN coverage of both platforms and adjust your models accordingly:

- [Camunda 7 BPMN coverage](https://docs.camunda.org/manual/7.24/reference/bpmn20/)
- [Camunda 8 BPMN coverage](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn-coverage)

When converting diagrams, the Diagram Converter also helps identify unsupported elements interactively.

#### Start events

- It is required that a process instance contains a single process level None Start Event to run the data migrator.
- If a process definition only has event-based start events (for example, Message, Timer), it is required to add a temporary None Start Event. This change must be reverted after the data migration is completed.
- Example adding a None Start Event:

```diff
  <bpmn:process id="Process_1fcbsv3" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_FromEventStartEvent</bpmn:outgoing>
      <bpmn:messageEventDefinition id="MessageEventDefinition_1yknqqn" />
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_FromEventStartEvent" sourceRef="StartEvent_1" targetRef="ActivityId" />
+   <bpmn:startEvent id="NoneStartEvent">
+     <bpmn:outgoing>Flow_FromNoneStartEvent</bpmn:outgoing>
+   </bpmn:startEvent>
+   <bpmn:sequenceFlow id="Flow_FromNoneStartEvent" sourceRef="NoneStartEvent" targetRef="ActivityId" />
    <bpmn:task id="ActivityId">
      <bpmn:incoming>Flow_FromEventStartEvent</bpmn:incoming>
      <bpmn:incoming>Flow_FromNoneStartEvent</bpmn:incoming>
      <bpmn:outgoing>Flow_1o2i34a</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent">
      <bpmn:incoming>Flow_1o2i34a</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1o2i34a" sourceRef="ActivityId" targetRef="EndEvent" />
  </bpmn:process>
```

#### Async before/after wait states

Camunda 8 does not support [asynchronous continuation before or after](https://docs.camunda.org/manual/latest/user-guide/process-engine/transactions-in-processes/#asynchronous-continuations) any kind of wait state. Service-task-like activities are executed asynchronously by default in Camunda 8 - so for example a service task waiting for asynchronous continuation before will be correctly migrated. But if you need to migrate an instance currently waiting asynchronously at other elements in a Camunda 7 model, such as a gateway for example, this instance would just continue without waiting in the equivalent Camunda 8 model. You might need to adjust your model's logic accordingly prior to migration.

#### Message events

- Only message catch and throw events are supported for migration.
- Depending on your implementation, you may need to add [a correlation variable](https://docs.camunda.io/docs/next/components/modeler/bpmn/message-events/message-events#messages) to the instance pre-migration.

#### Message and signal start events

- If your process starts with a message/signal start event, no token exists until the message/signal is received and hence no migration is possible until that moment.
- Once the message/signal is received, the token is created and moved down the execution flow and may be waiting at a migratable element inside the process. However, due to how the migration logic is implemented, at the moment the data migrator only supports processes that start with a normal start event.

#### Triggered boundary events

- Camunda 7 boundary events do not have a natural wait state.
- If the process instance to be migrated is currently at a triggered boundary event in Camunda 7, there may still be a job associated with that event, either waiting to be executed or currently running. In this state, the token is considered to be at the element where the job is created: typically the first activity of the boundary event’s handler flow, or technically the point after the boundary event if asyncAfter is used.
- During migration to Camunda 8, the token will be mapped to the corresponding target element. However, if that element expects input data that is normally produced by the boundary event’s job (for example, setting variables), this data may be missing in the migrated instance.
- Recommendation: To ensure a consistent migration, allow boundary event executions to complete before initiating the migration.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
