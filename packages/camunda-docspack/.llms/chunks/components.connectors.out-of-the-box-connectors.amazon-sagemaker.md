# Amazon SageMaker connector

Interact with the Amazon SageMaker connector from your BPMN process.

**Info**
The **Amazon SageMaker connector** is available for `8.6.0-alpha2` or later.

The **Amazon SageMaker connector** is an outbound connector that allows you to interact with
[Amazon SageMaker](https://aws.amazon.com/sagemaker/) from your BPMN process.


## Prerequisites

To use the **Amazon SageMaker connector**, you need to have an AWS account with an access key and secret key to
execute [`InvokeEndpoint`](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpoint.html) or
[`InvokeEndpointAsync`](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpointAsync.html) actions.

The necessary endpoints must be deployed beforehand and point to the operational model.

Learn more on how to deploy real-time and asynchronous models in the [official SageMaker documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-deployment.html).

**Note**
Use secrets to store credentials and avoid exposing sensitive information directly from the process. Refer to [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sagemaker
