# Amazon DynamoDB connector — Authentication

Choose an applicable authentication type from the **Authentication** dropdown. Learn more about authentication types in the related [appendix entry](#aws-authentication-types).

If you select **credentials** to access the **Amazon DynamoDB service**, the connector requires the appropriate credentials. The following authentication options are available:

- **Access key**: Provide an access key of a user with permissions to the Amazon DynamoDB service.
- **Secret key**: Provide the secret key of the user with the access key provided above.

The Access Key and Secret Key are required properties and must be provided to use the connector. If these properties are not set, the connector will not be able to authenticate with the [DynamoDB Service](https://aws.amazon.com/dynamodb/).

For more information on authentication and security in Amazon DynamoDB, refer to the [AWS documentation](https://docs.aws.amazon.com/dynamodb/index.html).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
