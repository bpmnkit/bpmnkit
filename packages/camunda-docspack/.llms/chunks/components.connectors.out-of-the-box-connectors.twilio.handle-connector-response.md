# Twilio connector — Handle connector response

The **Twilio connector** is a protocol connector built on top of the HTTP REST connector. Therefore, handling the response is still applicable and can be done as described in the [HTTP REST connector response documentation](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#response).

When using the **Twilio connector**, the response from the Twilio API will be available in a temporary local response variable. This variable can be mapped to the process by specifying the Result Variable.

For example, if you use the **Send SMS Message** method in the Twilio connector, the response may look like this:

```json
{
  "status": 201,
  "headers": {
    "content-type": "application/json"
  },
  "response": {
    "sid": "SM1234567890",
    "date_created": "2023-04-18T15:30:00Z",
    "date_updated": "2023-04-18T15:30:00Z",
    "date_sent": null,
    "account_sid": "AC1234567890",
    "from": "+1234567890",
    "to": "+0987654321",
    "body": "Hello, World!",
    "status": "queued",
    "num_segments": "1",
    "direction": "outbound-api",
    "api_version": "2010-04-01",
    "price": null,
    "price_unit": "USD",
    "error_code": null,
    "error_message": null,
    "uri": "/2010-04-01/Accounts/AC1234567890/Messages/SM1234567890.json",
    "subresource_uris": {
      "media": "/2010-04-01/Accounts/AC1234567890/Messages/SM1234567890/Media.json"
    }
  }
}
```

In this example, the response variable contains an SID attribute that uniquely identifies the message that was sent.

You can choose to unpack the content of your response into multiple process variables using the **Result Expression**, which is a FEEL Context Expression.

The Result Expression allows you to access specific attributes from the response and assign them to process variables that can be used in subsequent steps of your process.

```feel
= {
    sid: response.body.sid,
    date_created: response.body.date_created,
    from: response.body.from,
    to: response.body.to,
    body: response.body.body
}
```

In this example, we are using the Result Expression to extract the `sid`, `date_created`, `from`, `to`, and `body` attributes from the response variable and assign them to process variables with the same name. You can then use these variables in subsequent steps of your process.

**Note**
The syntax for accessing attributes in the Result Expression may vary depending on the structure of your response object. You can refer to the [FEEL Context Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions) documentation for more information on how to use the **Result Expression**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/twilio
