# Code Conversion — Diagram Converter

Your BPMN and DMN models need to be adjusted to work with Camunda 8.

Use the [Diagram Converter](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter) as the default for BPMN, DMN, and static Camunda 7 `.form` conversion. For generated task forms, use the [Camunda migration agent skill](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index#agentic-migration), which creates or adapts standard Camunda 8 forms after review. AI-generated model conversion depends materially on model capability and can silently change model semantics, so do not use AI-only model conversion as the default. Review converted models and findings before deployment.

**Tip**
The [Camunda migration agent skill](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index#agentic-migration) runs the Diagram Converter CLI as the default and can use AI to help investigate findings.

For full documentation, see the [Diagram Converter guide](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter).

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
