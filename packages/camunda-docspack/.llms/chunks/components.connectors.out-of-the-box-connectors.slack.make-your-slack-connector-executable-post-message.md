# Slack connector — Make your Slack connector executable — Post message

**Info**
This API uses the Slack [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage) method.
You need to ensure that your Slack application has related permissions enabled.

To post a message, take the following steps:

1. Set **Method** to `Post Message`.
2. Set **Channel/User Name** to either the **channel** or **user** you want to send the message to.
   1. A **channel** is specified by a unique identifier starting with a `#` (for example, `#myChannel`) or by using the channel id.
   2. A **user** is specified by a username starting with an `@` symbol (for example, `@myUser`).
3. (Optional) A **thread** can be specified to start a thread from a specific message. For example, `ts` in the response can be used (see [here](#post-message)). If the message has been posted by a user, we currently have no way to retrieve the `ts` value. Visit the [Slack documentation](https://api.slack.com/methods/chat.postMessage) for additional details.
4. Select a **Message type**.
   1. When **Plain text** is selected, set **Message** to the message string you would like to send (for example, `Hello World!`).
   2. When **Message block** is selected, set **Message block** to a formatted rich text block format. Learn more about rich text message block format in the [official Slack documentation](https://api.slack.com/reference/surfaces/formatting#stack_of_blocks).
5. (Optional) **Attachments** are the documents to include with the message. To work with attachments
   you must add `files:read` and `files:write` permissions for your **Bot Token Scopes** in your Slack app.

**Note**
Each attachment uses a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources): a **Camunda document** reference, **inline content** built from process data, or an **external document** URL. Use the **Single/Multiple** toggle to provide one document or a FEEL array of documents.

To use a **Camunda document**, upload it first — using the [REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api) for example — and assign the result to a variable in **Start Process instance** so you can reference it in the **Attachments** field.

**Note**
Starting from version 8.7.0, the Slack connector works with document handling to support adding attachments and increasing template versions. See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

The **Channel/User Name** and **Message** can either be given [static values](https://docs.camunda.io/docs/next/components/concepts/expressions#expressions-vs-static-values), or FEEL expressions. FEEL expressions can be used to [access process variables or dynamically create values](https://docs.camunda.io/docs/next/components/concepts/expressions). This can be handy if a process variable is used to store the relevant channel or if the message needs to be composed dynamically, for example:

`Channel/User Name` property might look like:

```
#slack-connectors
```

`Message` property:

```
= "Order-" + orderId + " was dispatched"
```

In the above example, the Channel/User Name is set to the [static value](https://docs.camunda.io/docs/next/components/concepts/expressions#expressions-vs-static-values) "#slack-connectors," which will post the message to the specified Slack channel. The **Message** property uses a FEEL expression to dynamically create the message content. It concatenates the string "Order-" with the value stored in the process variable orderId and adds "was dispatched" to complete the message. This way, the message will vary based on the specific orderId stored during the process execution.

**Note**
Slack's [guidance on formatting](https://api.slack.com/reference/surfaces/formatting#basics) can assist in formatting messages.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
