# Configuration — Process Test Coverage

CPT generates an HTML and JSON coverage report of your BPMN processes and DMN decision tables. You can configure the
report generation in the following way.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    coverage:
      # Change the directory where the report is generated
      reportDirectory: target/coverage-report
      # Exclude processes from the report by their process definition ID
      excludedProcesses:
        - process_1
        - process_2
      # Exclude decisions from the report by their decision definition ID
      excludedDecisions:
        - decision_1
        - decision_2
```

In your `/camunda-container-runtime.properties` file:

```properties
# Change the directory where the report is generated
coverage.reportDirectory=target/coverage-report
# Exclude processes from the report by their process definition ID
excludedProcesses[0]=process_1
excludedProcesses[1]=process_2
# Exclude decisions from the report by their decision definition ID
excludedDecisions[0]=decision_1
excludedDecisions[1]=decision_2
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
