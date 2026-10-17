# Diagram Converter

Learn how to use the Diagram Converter to analyze and convert Camunda 7 diagrams to Camunda 8.

With **Diagram Converter**, you'll get an initial understanding of the migration tasks you'll need to perform when moving from Camunda 7 to Camunda 8. It analyzes Camunda 7 BPMN, DMN, and Camunda 7 form definition files (`.form`) and generates a list of tasks required for the migration.

In a second step, it can also convert these files from the Camunda 7 format to the Camunda 8 format. For example, it updates namespaces, renames XML properties, and updates form metadata, if needed.

All BPMN elements supported by Camunda 8 can be transformed. For the full list see the [BPMN coverage page](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn-coverage).

**Tip: Automate diagram conversion with AI**
Use the [Camunda migration agent skill](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index#agentic-migration) to run the Diagram Converter CLI as part of an end-to-end migration workflow, resolve conversion findings with AI, and focus on reviewing migration-ready results.

You can use the Diagram Converter in the following ways:

- **Web Interface**: A wizard-like UI built with Java (Spring Boot) and React. Available versions:
  - Java JAR
  - Docker
  - Free, hosted SaaS
- **CLI**: A command-line interface implemented in Java.

The results are available as:

- **XLSX**: A Microsoft Excel file, including pre-built pivot tables for data exploration.
- **CSV**: A plain-text comma-separated file, compatible with any spreadsheet tool.
- **JSON**: A flat, machine-readable report for AI assistants and other automation.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter
