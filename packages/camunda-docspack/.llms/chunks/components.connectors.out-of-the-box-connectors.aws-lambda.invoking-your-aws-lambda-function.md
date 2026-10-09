# AWS Lambda connector — Invoking your AWS Lambda function

To make the **AWS Lambda connector** executable, fill out the mandatory fields highlighted in red in the properties panel on the right side of the screen:

1. Choose an applicable authentication type from the **Authentication** dropdown. Learn more about authentication types in the related [appendix entry](#aws-authentication-types).
2. Set the relevant IAM key and secret pair in the **Authentication** section. For example, `{{secrets.MY_AWS_ACCESS_KEY}}`. The value can be plain text, but this is not recommended due to security concerns.
3. Set the relevant AWS region in the **Authentication** section. Refer to the [Regions and Zones](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) to learn more.
4. In the **Select Operation** section, the default option is set to synchronous invocation; an asynchronous invocation option is currently not available. Refer to [event-driven invocation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html#event-driven-invocation) to learn more.
5. In the **Operation Details** section, fill out the field **Function name**. This field can be a [function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html?icmpid=docs_lambda_help), [function ARN](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html), function name, or alias.
6. (Optional) The **Payload** field in the **Operation Details** section is optional. This field requires FEEL input. Payload must be in JSON format as this is the data that will be processed by your Lambda function.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/aws-lambda
