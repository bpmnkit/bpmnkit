# SOAP connector — Output mapping

### Result variable

You can export a complete response from a SOAP call into a dedicated variable accessible anywhere in a process.
To do so, input a variable name in the **Result variable** field. Use a unique name to avoid
overwriting variables.

A typical response may look like as follows:

```json
{
  "Envelope": {
    "Header": {
      "MyHeader": "Header value"
    },
    "Body": {
      "MyResponseObject": {
        "MyResponseObjectField": "My result value"
      }
    }
  }
}
```

### Result expression

Additionally, you can choose to unpack the content of your `response` into multiple process variables using the **Result expression**, which is a [FEEL Context Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions).

Given SOAP service response that looks like as follows:

```json
{
  "Envelope": {
    "Header": {
      "MyHeader": "Header value"
    },
    "Body": {
      "MyResponseObject": {
        "MyResponseObjectField": "My result value"
      }
    }
  }
}
```

To extract the `MyResponseObjectField` value into its own variable, you can do:

```
= {
    MyResponseObjectResult: response.Envelope.Body.MyResponseObject.MyResponseObjectField
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/soap
