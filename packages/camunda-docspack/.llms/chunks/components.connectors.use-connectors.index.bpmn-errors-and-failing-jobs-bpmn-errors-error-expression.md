# How to use connectors — BPMN errors and failing jobs {#bpmn-errors} — Error expression

To support flexible exception handling,
the [out-of-the-box connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) allow
users to define an **Error Expression** in the **Error Handling** section at the bottom of the properties panel.

The example below uses this property to automatically inform the right group of people depending on the result of an
HTTP request against an internal website. If the website returns a valid result, this data is passed on to the regular
team.
In case of a [404](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) website response, the administrator is
informed, so they can check why the website cannot be reached. HTTP responses with
status [500](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500)
indicate internal website errors, which is why the website team is informed.

![feel connectors](../img/use-connectors-error-general.png)

The **Error Expression** property requires a [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) expression that yields a
BPMN error object in the end. The BPMN error object can be an
empty [context](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-data-types#context),
[null](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-data-types#null), or a context containing at least a non-empty
`errorType` and a non-empty `code` if the error type is `bpmnError`. You can use all available functionality provided by
FEEL to produce this result.

Use the provided FEEL functions:

- [`bpmnError`](#function-bpmnerror) to create a BPMN error object. This triggers
  a [ThrowError call](https://docs.camunda.io/docs/next/components/best-practices/development/dealing-with-problems-and-exceptions) to the workflow
  engine.
- [`jobError`](#function-joberror) to create a fail job object. This triggers
  a [FailJob call](https://docs.camunda.io/docs/next/components/best-practices/development/dealing-with-problems-and-exceptions) to the workflow
  engine.
- [`ignoreError`](#function-ignoreerror) to recover from an error and complete a job successfully. This triggers
  a [CompleteJob call](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/complete-job.api) to the workflow
  engine.

The `bpmnError` FEEL function can be called with one, two, or three parameters. Optionally, you can pass variables as the third parameter and combine this with a boundary event to use the variables in condition expressions when handling the error event. Example FEEL expression:

```
if response.body.status = "failed" then bpmnError("FAILED", "The action failed", response.body) else null
```

Within the FEEL expression, you access the following temporary variables:

- The result of the connector in `response`.
- The job of the invocation in `job` with the fields: `retries`
- Any result variables created by the **Result Variable** and **Result Expression** properties (see
  the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#response), for example).
- The technical exception that potentially occurred in `error`, containing a `message` and optionally a `code`. The code
  is only available if the connector's runtime behavior provided a code in the exception it threw.

**Info**
If a **Result Variable** or **Result Expression** is configured on the connector task, the raw connector response is **not** available as `response` in the error expression. Instead, `response` contains only the mapped output variables. Reference those variables by name (for example, `myVar.status`) rather than using `response.body`.

Building on that, you can cover those use cases with BPMN errors that you consider as exceptional. This can build on
technical exceptions thrown by a connector as well as regular results returned by the external system you integrated.
The [example expressions](#bpmn-error-examples) below can serve as templates for such scenarios.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
