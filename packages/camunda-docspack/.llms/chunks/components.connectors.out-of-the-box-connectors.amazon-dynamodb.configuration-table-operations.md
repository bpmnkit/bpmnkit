# Amazon DynamoDB connector — Configuration — Table operations

For the **Table** operation type, the following input data is required:

#### Create table

**Request**

| Property name                                                                                                                                                               | Data type | Required |                                      Description                                       |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: | :------: | :------------------------------------------------------------------------------------: |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-TableName)                                         |  string   |   Yes    |                     The name of the DynamoDB table to be created.                      |
| [Partition key](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-KeySchema)                                      |  string   |   Yes    |                 The attribute name of the partition key for the table.                 |
| [Partition key role](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-KeySchema)                                 | dropdown  |   Yes    |            The role of the partition key. Can be set to "HASH" or "RANGE".             |
| [Partition key attribute data type](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeDefinition.html#DDB-Type-AttributeDefinition-AttributeType) | dropdown  |   Yes    |                     The data type of the partition key attribute.                      |
| [Sort key](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-KeySchema)                                           |  string   |    No    |           The attribute name of the sort key for the table (if applicable).            |
| [Sort key role](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-KeySchema)                                      | dropdown  |    No    |               The role of the sort key. Can be set to "HASH" or "RANGE".               |
| [Sort key attribute data type](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeDefinition.html#DDB-Type-AttributeDefinition-AttributeType)      | dropdown  |    No    |                        The data type of the sort key attribute.                        |
| [Read capacity units](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-ProvisionedThroughput)                    |  number   |   Yes    | The maximum number of strongly consistent reads per second that the table can support. |
| [Write capacity units](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-ProvisionedThroughput)                   |  number   |   Yes    |          The maximum number of writes per second that the table can support.           |
| [Billing mode](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-BillingMode)                                     | dropdown  |    No    |    The billing mode of the table. Can be set to "PROVISIONED" or "PAY_PER_REQUEST".    |
| [Deletion protection](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html#DDB-CreateTable-request-GlobalSecondaryIndexUpdates)              | dropdown  |    No    |       Indicates whether to enable or disable deletion protection for the table.        |

**Response**

|                                                   Property                                                    | Data type | Description                                                                                                                                          |
| :-----------------------------------------------------------------------------------------------------------: | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Table description](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TableDescription.html) |  Object   | Information about the created table, including the table name, attribute definitions, primary key schema, provisioned throughput settings, and more. |

#### Delete table

**Request**

| Property name                                                                                     | Data type | Required |                  Description                  |
| :------------------------------------------------------------------------------------------------ | :-------: | :------: | :-------------------------------------------: |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteTable.html) |  string   |   Yes    | The name of the DynamoDB table to be deleted. |

**Response**

| Property | Data type |                                                              Description                                                              |
| :------- | :-------: | :-----------------------------------------------------------------------------------------------------------------------------------: |
| action   |  string   | The action performed. In this case, it will always be "delete Table [tableName]", where `tableName` is the name of the deleted table. |
| status   |  string   |        The status of the operation. In this case, it will always be "OK" to indicate that the table was successfully deleted.         |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
