# Amazon DynamoDB connector — Error handling

The **Amazon DynamoDB connector** may throw the following exceptions:

- AwsDynamoDbConnectionException: Thrown if there is an error connecting to DynamoDB.
- AwsDynamoDbExecutionException: Thrown if there is an error executing a DynamoDB operation.
- AwsDynamoDbConfigurationException: Thrown if the connector is not properly configured.

All of these checked exceptions are wrapped in a `RuntimeException`, so be prepared to handle this type of exception as well.


## Troubleshooting

If you are having issues with the **Amazon DynamoDB connector**, try the following:

- Ensure your AWS credentials are correct.
- Ensure your DynamoDB table exists and is located in the specified region.
- Ensure your configuration properties are set correctly.
- Check the logs for any error messages.
- Contact [Camunda support](https://camunda.com/services/support/) if you need further assistance.

For more information on Amazon DynamoDB, visit the [official documentation](https://docs.aws.amazon.com/dynamodb/).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
