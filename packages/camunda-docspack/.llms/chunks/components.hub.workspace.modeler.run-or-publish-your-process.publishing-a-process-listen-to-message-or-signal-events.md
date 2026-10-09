# Run or publish your process — Publishing a process — Listen to message or signal events

Camunda 8 supports message and signal events, which can be used to trigger a process instance when a specific event occurs. Everyone on the platform that knows the message or signal correlation keys can call such a process. To listen to a message or signal event, you need to define a [message](https://docs.camunda.io/docs/next/components/modeler/bpmn/message-events/message-events#message-start-events) or [signal start event](https://docs.camunda.io/docs/next/components/modeler/bpmn/signal-events/signal-events#signal-start-events) in your process model and configure it to listen for the desired event. Follow these steps to configure a message or signal start event:

1. In the process file, click the start event.
2. Select the **Change element** menu icon.
3. Select **Message start event** or **Signal start event**.
4. Open the **Details** panel on the right side of the modeling interface.
5. Under **Properties**, define the message or signal to listen to. Using messages, you can create a 1:1 relationship between calling processes. With signals, you can create broadcast-like message distributions.
6. [Deploy](#deploy-a-process) the process.

As soon as a matching event is received, a process instance will be started. To learn more about message and signal events, refer to our [documentation on events](https://docs.camunda.io/docs/next/components/modeler/bpmn/events).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process
