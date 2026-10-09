# Slack connector — Slack API response

The **Slack connector** exposes the Slack API response as a [local variable](https://docs.camunda.io/docs/next/components/concepts/variables#variable-scopes) called `response`.
Response contents are method-specific.

### Create channel

The following fields are available in the `response` variable after executing **Create Channel** method:

- **channel**:
  - **id**: channel ID
  - **name**: channel name

Notice that the **name** field can be subsequently used as an argument of **Post Message** method.

### Post message

The following fields are available in the `response` variable after executing the **Post Message** method.
Notice that all fields describe state in the Slack workspace:

- **ts**: timestamp ID
- **channel**: channel ID
- **message**:
  - **type**: message type
  - **team**: team ID
  - **user**: user ID
  - **text**: message text
  - **ts**: timestamp ID
  - **appID**: Slack App ID
  - **botID**: Slack Bot ID

### Output mapping

You can use an Output Mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. For example:

```
= {
    messageText: response.message.text
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
