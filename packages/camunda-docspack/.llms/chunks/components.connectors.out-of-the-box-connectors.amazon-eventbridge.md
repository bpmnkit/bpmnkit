# Amazon EventBridge connector

Send events to Amazon EventBridge from your BPMN process.

The **Amazon EventBridge connector** integrates your BPMN service with [Amazon EventBridge](https://aws.amazon.com/eventbridge/), enabling the sending of events from your workflows for further processing or routing to other AWS services. It provides seamless event-driven integration within your business processes.

For more information, refer to the [Amazon EventBridge documentation](https://docs.aws.amazon.com/eventbridge/index.html).


## Prerequisites

Before using the **Amazon EventBridge connector**, ensure you have the necessary permissions in your AWS account to send events to EventBridge. You will need an access key and secret key of a user with the appropriate permissions. Refer to the [AWS documentation](https://docs.aws.amazon.com/eventbridge/latest/userguide/auth-and-access-control-eventbridge.html) for more information.

**Note**
Use secrets to avoid exposing your AWS IAM credentials as plain text. Refer to our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-eventbridge
