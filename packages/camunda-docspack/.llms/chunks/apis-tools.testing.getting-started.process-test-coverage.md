# Camunda Process Test — Process Test Coverage

After a test run, CPT prints the coverage of your BPMN processes and DMN decision tables to the log and generates a
detailed HTML and JSON report. You can use the report to identify untested paths in your processes and decision tables, and increase your test coverage.

A link to the HTML report is printed in the log:

```
Coverage: io.camunda.InvoiceApprovalTest
========================
Process coverage:
- Process_InvoiceApproval: 96%

Decision coverage:
- auto-approve-invoice: 20%

 Coverage report: file:///my/home/projects/my-process-application/target/coverage-report/report.html
```

![An example process test coverage HTML report](assets/process-coverage-report.png)

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/getting-started
