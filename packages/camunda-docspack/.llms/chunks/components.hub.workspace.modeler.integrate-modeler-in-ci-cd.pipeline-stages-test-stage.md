# Integrate Camunda Hub into CI/CD — Pipeline stages — Test stage

Keep strict quality standards for your processes with automatic testing and reporting.

#### Lint your diagrams

Add a step to your pipeline for automatic process verification using the [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [dmnlint](https://github.com/bpmn-io/dmnlint) libraries. Maintained by the bpmn-io team at Camunda, these open source libraries provide a default set of verification rules, as well as the option to add custom rules. They provide reporting capabilities to report back when the verification fails. These are the same libraries Camunda Hub uses to verify diagrams during modeling.

You could even report the wrong diagram patterns together with examples to resolve it using [this extension](https://github.com/bpmn-io/bpmnlint-generate-docs-images).

#### Unit and integration tests

For unit tests, select a test framework suitable for your environment. If working with Java, the [camunda-process-test](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started) library is an excellent option. Alternatively, employ the [Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started) with JUnit for testing your BPMN and DMN diagrams in dev or preview environments. Similar testing can be performed using [community-built clients](https://docs.camunda.io/docs/next/apis-tools/community-clients/index).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd
