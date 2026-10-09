# Amazon DynamoDB connector — Response Mapping

When using the DynamoDB connector, the response from the DynamoDB connector will be available in a temporary local `response` variable. This variable can be mapped to the process by specifying the **Result Variable**.

For example, if you use the **Update Item** method in the DynamoDB connector, the response may look like this:

```json
{
  "action": "updateItem",
  "status": "OK",
  "response": {
    "Attributes": {
      "ID": {
        "N": "3"
      },
      "price": {
        "N": "10"
      }
    }
  }
}
```

In this example, the `response` variable contains an `Attributes` object with the updated values for the specified item.

The following fields are available in the `response` variable:

- `action`: The action that was performed by the DynamoDB connector.
- `status`: The status of the response, which will be "OK" if the operation was successful.
- `response`: The response from the DynamoDB service, which will contain the updated attributes of the specified item.

You can choose to unpack the content of your `response` into multiple process variables using the **Result Expression**, which is a [FEEL Context Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions).

The **Result Expression** allows you to access specific attributes from the response and assign them to process variables that can be used in subsequent steps of your process.

```feel
= {
    id: response.response.Attributes.ID.N,
    price: response.response.Attributes.price.N
}
```

In this example, we are using the **Result Expression** to extract the **ID** and **price** attributes from the response variable and assign them to the ID and price process variables, respectively. You can then use these variables in subsequent steps of your process.

**Note**
The syntax for accessing attributes in the **Result Expression** may vary depending on the structure of your response object. You can refer to the [FEEL Context Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions) documentation for more information on how to use the **Result Expression**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-dynamodb
