# Amazon DynamoDB connector — Configuration — Item operations (2)

**Response**

| Property                                                                                                                | Data type | Description                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Attributes](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html#DDB-GetItem-response-Item) | object    | A map of attribute names to `AttributeValue` objects, representing the item retrieved. If there is no matching item, the response will contain only the consumed capacity, and a null attributes field. The keys of the attributes map correspond to the column names of the table |

#### Update item

**Request**

| Property name                                                                                                                                  | Data type | Required | Description                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| [Table name](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html#DDB-UpdateItem-request-TableName)              | string    | Yes      | The name of the table to update the item in.                                                                              |
| [Primary key components](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html#DDB-UpdateItem-request-Key)        | map       | Yes      | A map of attribute names to `AttributeValue` objects, representing the primary key of the item to update.                 |
| [Key attributes](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html#DDB-UpdateItem-request-AttributeUpdates)   | map       | Yes      | A map of attribute names to `AttributeValue` objects, representing the attributes to update.                              |
| [Attribute action](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html#DDB-UpdateItem-request-AttributeUpdates) | dropdown  | No       | Dropdown option for each attribute to be updated, allowing selection between "PUT" (add or replace) and "DELETE" (remove) |

**Response**

| Property                                                                                                                                            | Data type | Description                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [UpdateItemOutcome](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBMapper.Methods.html#DynamoDBMapper.Methods.updateItem) | object    | An object representing the outcome of the `UpdateItem` operation. The `UpdateItemOutcome` object contains the updated attributes of the item, as well as other metadata about the operation, such as the consumed capacity. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
