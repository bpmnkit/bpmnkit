# Amazon Bedrock connector

Interact with the Amazon Bedrock connector from your BPMN process.

The **Amazon Bedrock connector** is an outbound connector that allows you to interact with
[Amazon Bedrock](https://aws.amazon.com/bedrock/) from your BPMN process.


## Prerequisites

To use the **Amazon Bedrock connector**, you need to have an AWS account with an access key and secret key to
execute [`InvokeModel`](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html) or
[`Converse`](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html) actions.

The necessary models must be enabled beforehand on the region you are operating from. See more about
this [in the Amazon Bedrock user guide](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html).

Learn more about Amazon bedrock in
the [official Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html).

**Note**
Use secrets to store credentials and avoid exposing sensitive information directly from the process. Refer
to [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock
