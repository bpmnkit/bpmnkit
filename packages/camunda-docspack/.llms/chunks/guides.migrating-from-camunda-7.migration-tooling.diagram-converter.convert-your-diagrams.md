# Diagram Converter — Convert your diagrams

As mentioned, the Diagram Converter can also convert BPMN and DMN diagrams for use with Camunda 8.

This includes:

- Updating namespaces
- Adjusting XML structure and properties
- Transforming expressions

Converted files can be downloaded via the web interface or generated via the CLI.


## Convert Camunda 7 forms

The Diagram Converter supports Camunda 7 form definition files (`.form`). You can upload forms through the web interface or include them in a local CLI conversion to update them for Camunda 8. The web interface provides a form preview, and the converter reports items that need review.

For generated task forms, use the [Camunda migration agent skill](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index#agentic-migration), which creates or adapts a standard Camunda 8 form during the agentic migration flow.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter
