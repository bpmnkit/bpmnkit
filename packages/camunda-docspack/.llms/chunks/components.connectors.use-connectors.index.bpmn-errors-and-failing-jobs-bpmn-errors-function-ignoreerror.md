# How to use connectors — BPMN errors and failing jobs {#bpmn-errors} — Function ignoreError

Allows you to complete a job successfully when an error occurs and returns a context entry with an optional `variables` property. These `variables` are used when sending the complete job command to the engine:

```feel
ignoreError({"status":"ok"})
```

You can also ignore the error without providing `variables` leading to a job completion without any variables:

```feel
ignoreError()
```

After defining error-handling functions, you can use them in FEEL expressions as shown in the following examples.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
