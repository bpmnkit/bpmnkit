# Amazon SageMaker connector — Handle connector response

## Amazon SageMaker connector response

The response of the **Amazon SageMaker connector** depends on the model deployed and an inference type.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables.

### Real-time inference response

The response of the real-time inference depends on your model deployed.
Refer to the [Amazon SageMaker documentation](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpoint.html#API_runtime_InvokeEndpoint_ResponseElements)
to learn more.

### Asynchronous inference response

The response of the real-time inference depends on your model deployed.
Refer to the [AWS SageMaker documentation](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpointAsync.html#API_runtime_InvokeEndpointAsync_ResponseElements)
to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sagemaker
