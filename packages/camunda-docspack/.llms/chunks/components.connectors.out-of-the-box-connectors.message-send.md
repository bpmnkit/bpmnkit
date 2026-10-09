# Message Send connector

Send BPMN messages in Camunda by publishing buffered messages or correlating messages directly with a process instance.

The Message Send connector can **publish** or **correlate** BPMN messages.  
It either calls the [PublishMessage RPC](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service#publishmessage-rpc) of the Zeebe API to send messages buffered by Zeebe, or the [Correlate a message REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/correlate-message.api) to get the ID of the process instance that received the message without buffering.

The element template allows you to select the mode:

- `publish message (with buffer)`
- `correlate message (with result)`

and fill all parameters directly in the modeler.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/message-send
