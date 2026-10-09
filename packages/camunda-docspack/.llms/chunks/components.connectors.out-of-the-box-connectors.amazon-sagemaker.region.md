# Amazon SageMaker connector — Region

In the **Region** field write the region of the deployed endpoint.


## Inference type

Learn more about inferences at the [official Amazon SageMaker documentation page](https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html).

### Real-time

Ensure you deployed your model with a real-time endpoint.

- In the **Inference type** field, select **Real-time**.
- In the **Endpoint name** field, enter your deployed real-time endpoint name.
- In the **Payload** field, enter data that is required by your deployed model.
- In the **Content type** field, enter the content type of the input. Be aware that the **Amazon SageMaker connector** currently supports only JSON-like content types.
- In the **Accept** field, enter the content type of the return value.
- Fill in the other fields as described in the [SageMaker documentation](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpoint.html).

### Asynchronous

- In the **Inference type** field, select **Asynchronous**.
- In the **Endpoint name** field, enter your deployed asynchronous endpoint name.
- In the **Input location** field, enter an S3 URL where the inference payload is stored.
- In the **Content type** field, enter the content type of the input. Unlike the real-time, this inference supports any kind of content type.
- In the **Accept** field, enter the content type of the return value.
- Fill in the other fields as described in the [SageMaker documentation](https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpointAsync.html).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sagemaker
