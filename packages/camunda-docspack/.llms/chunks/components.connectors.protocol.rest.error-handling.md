# REST connector — Error handling

If an error occurs, the connector throws an error and includes the error response in the `error` variable in Operate. Click on the REST connector in Operate to see this variable.

The following example shows the `error` variable in an error response:

```json
{
  "code": "400",
  "variables": {
    "response": {
      "headers": {
        "Content-Length": "70",
        "Date": "Thu, 17 Oct 2024 09:31:51 GMT",
        "Content-Type": "application/json"
      },
      "body": {
        "temperature": 36,
        "message": "My custom error message",
        "booleanField": true
      }
    }
  },
  "message": "Bad Request",
  "type": "io.camunda.connector.api.error.ConnectorException"
}
```

You can handle this error using an Error Boundary Event and the following error expression:

```json
if matches(error.code, "400") and error.variables.response.body.temp = 36
then bpmnError("Too hot", error.variables.response.body.message, error.variables.response.body)
else null
```

In this example, passing `error.variables.response.body` as the third argument to the `bpmnError` function allows you to pass additional information about the error to the error boundary event. For example, the `message`, `temperature` and `booleanField` fields from the error response are passed to the error boundary event.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
