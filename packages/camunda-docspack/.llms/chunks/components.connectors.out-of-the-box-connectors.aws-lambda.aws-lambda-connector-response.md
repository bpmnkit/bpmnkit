# AWS Lambda connector — AWS Lambda connector response

The **AWS Lambda connector** returns the HTTP status code, executed version, and payload (the response from the function, or an error object).
The following fields are available in the response variable:

- `statusCode` - HTTP status code returned by the AWS Lambda Invoke API. This shows whether AWS Lambda accepted and handled the invocation request. It does not indicate whether the Lambda function itself returned a successful result.
- `executedVersion` - Executed version of the Lambda function.
- `payload` - The response returned by the Lambda function, or an error object. If your function returns its own `statusCode` in the payload, that value describes the function result and is separate from the top-level connector `statusCode`.

If your Lambda function includes a `statusCode` in its response body, access it with `response.payload.statusCode` rather than `response.statusCode`.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. For example:

```
= {
  "myNewReportStatusCode": response.statusCode,
  "myNewReportExecutedVersion": response.executedVersion,
  "myNewReportPayload": response.payload
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/aws-lambda
