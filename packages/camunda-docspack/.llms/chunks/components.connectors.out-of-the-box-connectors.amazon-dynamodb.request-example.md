# Amazon DynamoDB connector — Request example

| Section        | Field                  | Description                                                                                                                        | Example value                                                               |
| -------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Operation      | Category               | Choose the category of the operation to be performed.                                                                              | Item                                                                        |
|                | Action                 | Select the specific action to update an item in the DynamoDB table.                                                                | Update item                                                                 |
| Authentication | Authentication type    | The method of AWS authentication; credentials are used here.                                                                       | Credentials                                                                 |
|                | Access key             | An example of an AWS access key.                                                                                                   | `AKIAU3GOTH...JBYX`                                                         |
|                | Secret key             | An example of an AWS secret key.                                                                                                   | `bZ/LPpqaw...0igikS`                                                        |
|                | Region                 | The AWS region where the DynamoDB table is located.                                                                                | `us-east-1`                                                                 |
| Input          | Table name             | The name of the DynamoDB table to be updated.                                                                                      | `test`                                                                      |
|                | Primary key components | The primary key component(s) of the item to be updated.                                                                            | `{"id": "5"}`                                                               |
|                | Key attributes         | JSON object representing the new values for the item attributes.                                                                   | `{ "stringValue": "StringValue", "numberValue": 42, "booleanValue": true }` |
|                | Attribute action       | The action to be performed on the attributes. Here it's set to PUT, which means the specified attributes will be added or updated. | PUT                                                                         |
| Output mapping | Result variable        | The name of the variable that will store the response from DynamoDB.                                                               | `result`                                                                    |
|                | Result expression      | The FEEL expression used to map the DynamoDB response to process variables. Not provided in the screenshots.                       | -                                                                           |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
