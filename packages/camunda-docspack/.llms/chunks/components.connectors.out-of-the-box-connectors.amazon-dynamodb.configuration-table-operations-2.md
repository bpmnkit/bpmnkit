# Amazon DynamoDB connector — Configuration — Table operations (2)

#### Describe table

**Request**

| Property name                                                                                       | Data type | Required |                   Description                   |
| :-------------------------------------------------------------------------------------------------- | :-------: | :------: | :---------------------------------------------: |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DescribeTable.html) |  string   |   Yes    | The name of the DynamoDB table to be described. |

**Response**

|                                                   Property                                                    | Data type | Description                                                                                                                                  |
| :-----------------------------------------------------------------------------------------------------------: | :-------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Table description](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TableDescription.html) |  Object   | Information about the table, including the table name, attribute definitions, primary key schema, provisioned throughput settings, and more. |

#### Scan table

**Request**

| Property name                                                                                                                                         | Data type | Required | Description                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html#DDB-Scan-request-TableName)                                 | string    | Yes      | The name of the DynamoDB table to be scanned.                                                                                                                                                                                                                                                                                              |
| [Filter expression](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/QueryAndScan.html#FilterExpression)                              | string    | No       | The filter expression to apply to the scan results. For more information, refer to the [Expression Attribute Names and Values](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html) section of the Amazon DynamoDB Developer Guide.                                                 |
| [Projection expression](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/QueryAndScan.html#ProjectionExpression)                      | string    | No       | A string that identifies one or more attributes to retrieve from the specified table.                                                                                                                                                                                                                                                      |
| [Expression attribute names](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ExpressionPlaceholders.html#ExpressionAttributeNames)   | map       | No       | A map of attribute names to their replacements in the filter expression or projection expression. For more information, refer to the [Expression Attribute Names and Values](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html) section of the Amazon DynamoDB Developer Guide.   |
| [Expression attribute values](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ExpressionPlaceholders.html#ExpressionAttributeValues) | map       | No       | A map of attribute values to their replacements in the filter expression or projection expression. For more information, refer to the [Expression Attribute Names and Values](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeValues.html) section of the Amazon DynamoDB Developer Guide. |

**Response**

| Property | Data type |                                                                Description                                                                |
| :------- | :-------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
| action   |  string   |                                    The action performed. In this case, it will always be `scanTable`.                                     |
| status   |  string   |                The status of the operation. If successful, it will always be "OK". Otherwise, it will be an error message.                |
| items    |   list    | The list of items returned by the scan operation, in case the operation was successful. If there are no items, this field will be `null`. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
