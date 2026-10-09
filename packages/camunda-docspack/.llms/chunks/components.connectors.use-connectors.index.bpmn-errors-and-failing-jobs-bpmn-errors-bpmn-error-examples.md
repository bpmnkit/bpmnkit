# How to use connectors — BPMN errors and failing jobs {#bpmn-errors} — BPMN error examples

#### HTTP errors to BPMN errors

Using the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest), you can handle HTTP errors directly in your
business process model by setting a header named `errorExpression` with the following value:

```feel
if error.code = "404" then
  bpmnError("404", "Got a 404")
else if error.code = "500" then
  bpmnError("500", "Got a 500")
else if response.body.status = "failed" then
  bpmnError("FAILED", "Action failed", response.body)
else if error.code = "409" then
  ignoreError({"created":true})
else
  null
```

This will create BPMN errors for HTTP requests that return with a
status [404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404)
or [500](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500).
You can extend that list to all HTTP errors you can handle as business use cases, for example by informing a website
administrator directly via Slack using the [Slack connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack).

#### Response value to BPMN error

Using the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) or any other connector that returns a result, you
can handle a response as a BPMN error based on its value, by setting a header named `errorExpression` with the following
value:

```feel
if response.body.main.humidity < 0 then
  bpmnError("HUMIDITY-FAIL", "Received invalid humidity")
else null
```

This is assuming you requested data from a local weather station and received a value that is technically valid for the
REST connector.
However, you could define that for your business case a humidity value below `0` must be an error that should be checked
manually.
You could automatically send a message to a technician to check the weather station.

#### Generic Header to transform a connectorException to a BPMN Error

If the connector throws a `ConnectorException` like:

```java
  throw new ConnectorException("HUMIDITY-FAIL","Received invalid humidity");
```

Then you can transform this exception to a BPMN error with this expression in a Header item named `errorExpression`:

```feel
if is defined(error) then bpmnError(error.code, error.message) else null
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
