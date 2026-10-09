# Amazon EventBridge connector — Configure the Amazon EventBridge connector

Follow these steps to configure the Amazon EventBridge connector:

1. Choose an applicable authentication type from the **Authentication** dropdown. Learn more about authentication types in the related [appendix entry](#aws-authentication-types).
2. In the **Authentication** section, enter the relevant IAM key and secret pair of the user with permissions to send events to [Amazon EventBridge](https://aws.amazon.com/eventbridge).
3. In the **Configuration** section, specify the AWS region where your EventBridge resides.
4. In the **Event Details** section, provide the following information:
   - **Event bus name**: Enter the name of the destination event bus. Refer to the [Amazon EventBridge documentation](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-event-bus.html) for more details on event buses.
   - **Source**: Enter the value that identifies the service that generated the event.
   - **Detail type**: Enter the type of event being sent. Refer to the [Amazon documentation](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events-structure.html) for more information on these properties.
5. In the **Event Payload** section, enter a JSON object that contains information about the event.
6. (Optional) In the **Output Mapping** section, you can set a **Result variable** or **Result expression**. Refer to the [response mapping documentation](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#response-mapping) to learn more.
7. (Optional) In the **Error Handling** section, define the **Error expression** to handle errors that may occur during the event sending process. Refer to the [response mapping documentation](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#bpmn-errors-and-failing-jobs) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-eventbridge
