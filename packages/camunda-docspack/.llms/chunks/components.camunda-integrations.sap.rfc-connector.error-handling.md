# SAP RFC connector — Error handling

The SAP RFC connector allows handling of query errors directly in the model. This means an RFC error is relayed to the process instance in the reserved variables `bpmnError` and `error` and can be processed accordingly:

```
DESTINATION_ERROR,
REQUEST_EXECUTION_ERROR,
REQUEST_SERIALIZATION_ERROR,
JCO_RUNTIME_ERROR,
GENERIC_ERROR
```

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector
