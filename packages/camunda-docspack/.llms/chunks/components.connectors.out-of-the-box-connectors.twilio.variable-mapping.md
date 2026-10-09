# Twilio connector — Variable mapping

The **Variable mapping** section allows you to configure the mapping of the webhook request to the process variables.

- Use the **Result variable** to store the response in a process variable. For example, `myResultVariable`.
- Use the **Result expression** to map specific fields from the response into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel). For example, given that the **Twilio Webhook connector** is triggered with the webhook:

  ```
  {
    "body": {
      "ApiVersion": "2010-04-01",
      "FromCountry": "EU",
      "Body": "Hello world",
      "SmsStatus": "received"
      ...
    }
    ...
  }
  ```

  and you would like to extract the `SmsStatus` as a process variable `mySmsStatus`, the **Result Expression** might look like this:

  ```
  = {
    mySmsStatus: request.body.SmsStatus
  }
  ```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/twilio
