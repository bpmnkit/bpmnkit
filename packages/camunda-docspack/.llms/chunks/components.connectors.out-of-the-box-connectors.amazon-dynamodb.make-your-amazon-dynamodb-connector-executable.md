# Amazon DynamoDB connector — Make your Amazon DynamoDB connector executable

To work with **Amazon DynamoDB connector**, choose the required operation type in the **Operation** section and complete the
mandatory fields highlighted in red in the connector properties panel on the right side of the screen.

**Note**
All the mandatory and non-mandatory fields depending on the authentication selection you choose are covered in the upcoming sections.


## Operation

Choose an operation type of either **Table** or **Item** in the **Operation** section:

- **Table**: Perform operations on a DynamoDB table.
- **Item**: Perform operations on a specific item in a DynamoDB table.

### Method

Choose one of the following methods:

#### [Table](#table-operations)

- [Create table](#create-table): Creates a new DynamoDB table.
- [Delete table](#delete-table): Deletes an existing DynamoDB table.
- [Describe table](#describe-table): Returns information about a DynamoDB table.
- [Scan table](#scan-table): Returns one or more items and their attributes by accessing every item in a table. You can use filter expressions to selectively scan for items that meet certain criteria.

#### [Item](#item-operations)

- [Add item](#add-item): Creates a new item or replaces an existing item with a new item.
- [Delete item](#delete-item): Deletes a single item in a table by primary key.
- [Get item](#get-item): Returns a set of attributes for the item with the given primary key.
- [Update item](#update-item): Modifies an existing item's attributes or adds a new item to the table if it does not already exist.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
