# Integrate IDP into your processes — Error handling

If an error occurs, the IDP extraction connector throws an error and includes the error response in the error variable in Operate.

### Error expression

You can handle an IDP extraction connector error using an Error Boundary Event and [error expressions](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#error-expression).


## Retries

### Retries

Specify the number of [retries](https://docs.camunda.io/docs/next/components/connectors/use-connectors/outbound#retries) (times) the IDP extraction connector repeats execution if it fails.

### Retry backoff

Specify a custom **Retry backoff** interval between retries instead of the default behavior of retrying immediately.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate
