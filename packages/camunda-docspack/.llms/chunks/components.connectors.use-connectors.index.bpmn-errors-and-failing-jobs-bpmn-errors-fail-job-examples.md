# How to use connectors — BPMN errors and failing jobs {#bpmn-errors} — Fail job examples

#### HTTP errors to fail job

Using the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest), you can handle HTTP errors directly in your
business process model by setting a header named `errorExpression` with the following value:

```feel
if error.code = "404" then
  jobError("Resource not found")
else if error.code = "504" then
  jobError("Gateway timeout", {},job.retries - 1, @"PT30S")
else if response.body.status = "technicalProblem" then
  jobError("Technical Problem", response.body)
else
  null
```

This will allow you to control the job failure for HTTP requests that return with
status [404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404)
or [504](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/504).
You can extend that list to all HTTP errors you can handle as a custom fail job; for example, to go to 0 retries
instantly or increase the retry timeout.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
