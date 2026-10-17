# SAP OData connector — Working with the SAP OData connector in Camunda Modeler — Error handling

The SAP OData connector allows handling of query errors directly in the model. This means an OData error is relayed to the process instance in the reserved variables `bpmnError` and `error` and can be processed accordingly.

1. Equip the connector task with an error handling expression such as:

```js
if error.code = "400" then
  bpmnError("400", "client request is bad", { errorMessage: error.message, errorCode: error.code })
else if error.code = "404" then
  bpmnError("404", "queried resource not found", { errorMessage: error.message, errorCode: error.code })
else if error.code = "500" then
  bpmnError("500", "server error", { errorMessage: error.message, errorCode: error.code })
else if error.code = "503" then
  bpmnError("503", "I'm just an proxy teapot", { errorMessage: error.message, errorCode: error.code })
else
  null
```

![image-20241010160419616](./img/odata-connector-error-expression.png)

2. Specifically note the third parameter to `bpmnError`:

```js
{ errorMessage: error.message, errorCode: error.code }
```

This relays the error message and code to the next step in the process flow.

3. Equip the BPMN task with an error boundary event:

![error boundary event on SAP OData connector](./img/sap-odata-connector-task-error-handling2.png)

If the SAP OData connector encounters an error, the boundary event will catch the error and continue the process flow. The error boundary event can receive these configuration parameters to contain further error details:

![error output mapping](./img/sap-odata-connector-task-error-handling1.png)

- `errorMessage`: Contains a verbose version of the error message and cause and relays it into the process scope as `ov_errorMessage`.
- `errorCode`: Holds a predefined value describing the scope of the error, relaying it to the process scope as `errorCode`. It can be one of the following:
  - `INVALID_PAYLOAD`: The payload of the request was detected as erroneous by the server.
  - `REQUEST_ERROR`: The request contained an error, for example, a wrong combination of `GET` query parameters.
  - `GENERIC_ERROR`
  - `DESTINATION_ERROR`: An error occurred while claiming the Destination from the runtime environment.
- `error`: The serialized Error object, available in the example above as `ov_error`.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
