# Amazon DynamoDB connector — Configuration — Item operations

**Note**
The **Amazon DynamoDB connector** does not currently support binary data types. If binary data is input during the creation or update of items, it will be saved as a string.

When updating items, if an attribute of type SET is updated, it will be overwritten and saved as a list type. Consider these limitations to prevent unintended data structure modifications in your DynamoDB tables.

#### Add item

**Request**

| Property name                                                                                                               | Data type | Required | Description                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html#DDB-PutItem-request-TableName) | string    | Yes      | The name of the DynamoDB table to add the item to.                                                                                                                                                                                                                                                                            |
| [Item](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html#DDB-PutItem-request-Item)            | object    | Yes      | The item to add to the table is represented in JSON format. For example: `{"Name": "Example Item", "ID": "123", "Description": "This is an example item"}`.This JSON object succinctly represents the item's attributes through straightforward key-value pairs, without the need to explicitly mention data types. |

**Response**

| Property                                                                                                               | Data type | Description                   |
| ---------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------- |
| [Result](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html#API_PutItem_ResponseElements) | object    | The item to add to the table. |

#### Delete item

**Request**

| Property name                                                                                                                                                  | Data type | Required | Description                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ------------------------------------------------------------ |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html#DDB-DeleteItem-request-TableName)                              | string    | Yes      | The name of the DynamoDB table to delete the item from.      |
| [Primary Key Components](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html#HowItWorks.CoreComponents.PrimaryKey) | object    | Yes      | The primary key components that identify the item to delete. |

**Response**

| Property                                                                                                                           | Data type | Description                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| [Deleted Item](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html#API_DeleteItem_ResponseElements) | object    | The item that was deleted. This field will be null if the item was not found. |

#### Get item

**Request**

| Property Name                                                                                                                     | Data type | Required | Description                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html#DDB-GetItem-request-TableName)       | string    | Yes      | The name of the table containing the requested item.                                                                                                                                                                                                                                                                                                                    |
| [Primary key components](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html#DDB-GetItem-request-Key) | object    | Yes      | A map of attribute names to `AttributeValue` objects, representing the primary key of the item to retrieve. For the primary key, you must provide all the attributes. For example, with a simple primary key, you only need to provide a value for the partition key. For a composite primary key, you must provide values for both the partition key and the sort key. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
