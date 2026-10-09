# Amazon SageMaker connector — Make your Amazon SageMaker connector executable

To work with the **Amazon SageMaker connector**, fill all mandatory fields.


## Authentication

Choose an applicable authentication type from the **Authentication** dropdown. Learn more about authentication types in the related [appendix entry](#aws-authentication-types).

If you select **Credentials** to access the **Amazon SageMaker connector**, the connector requires the appropriate credentials. The following authentication options are available:

- **Access key**: Provide an access key of a user with permissions to the Amazon SageMaker `InvokeEndpoint` and/or `InvokeEndpointAsync` actions.
- **Secret key**: Provide the secret key of the user with the access key provided above.

The **Access Key** and the **Secret Key** are required properties and must be provided to use the connector.

For more information on authentication and security in Amazon SageMaker, refer to the [AWS Knowledge Center post](https://repost.aws/knowledge-center/sagemaker-minimum-permissions).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sagemaker
