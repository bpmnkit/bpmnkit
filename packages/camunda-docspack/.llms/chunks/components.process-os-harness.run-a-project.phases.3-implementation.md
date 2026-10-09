# Implement the Camunda solution

The implementation phase generates execution-ready Camunda artifacts and job workers, then validates them with process tests, integration tests, and worker unit tests.


## About

Implementation turns a chosen to-be tier into a deployable Camunda solution.

1. ProcessOS Harness first generates the execution-ready artifacts, including BPMN, DMN tables, Camunda Forms, and job workers, from the transformation output.
1. It then deploys the solution to a development or test cluster so it can be exercised end-to-end.
1. Finally, it generates and runs three layers of tests, so you can see the solution behaves as intended before it moves into your own release process.

**Warning**
These commands target a development or test cluster. Deploying to production is outside the scope of ProcessOS Harness, and remains your own release process.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/run-a-project/phases/3-implementation
